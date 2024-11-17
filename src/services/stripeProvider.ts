import { eq } from "drizzle-orm";
import { db } from "../database/connection";
import {
  subscriptionTable,
  paymentTable,
  paymentProviderTable,
  subscriptionStatusEnum,
} from "../database/models/subscription";
import { User } from "../types";
import { PaymentProvider } from "./PaymentProvider";
import Stripe from "stripe";
import { userTable } from "../database/models/user";

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-06-20",
    });
  }

  async createSubscription(planId: string, user: User): Promise<object> {
    try {
      let customer: Stripe.Customer | Stripe.DeletedCustomer;
      let subscription: Stripe.Subscription;
      let existingCustomer;

      [existingCustomer] = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.userId, user.id));

      if (existingCustomer) {
        customer = await this.stripe.customers.retrieve(
          existingCustomer.customerId
        );
        console.log("Customer retrieved:", customer.id);
      } else {
        customer = await this.stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id },
        });
        console.log("Customer created:", customer.id);

        await db.insert(subscriptionTable).values({
          userId: user.id,
          customerId: customer.id,
          status: "pending",
          planId: planId,
        });
      }

      subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: planId }],

        payment_behavior: "default_incomplete",
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
      });

      console.log("Subscription created:", subscription.id);

      const [updatedSub] = await db
        .update(subscriptionTable)
        .set({
          status: subscriptionStatusEnum.enumValues[3],
          planId: planId,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(subscriptionTable.userId, user.id))
        .returning();

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      if (!paymentIntent || !paymentIntent.client_secret) {
        throw new Error("Failed to get client secret from PaymentIntent");
      }

      const [stripeProvider] = await db
        .select()
        .from(paymentProviderTable)
        .where(eq(paymentProviderTable.name, "stripe"));

      if (!stripeProvider) {
        throw new Error("Stripe payment provider not found in the database");
      }

      await db.insert(paymentTable).values({
        subscriptionId: updatedSub.id,
        providerId: stripeProvider.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: "pending",
        providerCustomerId: customer.id,
        providerPaymentId: paymentIntent.id,
        providerSubscriptionId: subscription.id,
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const canceledSubscription = await this.stripe.subscriptions.cancel(
        subscriptionId
      );
      console.log("Subscription canceled:", canceledSubscription.id);

      await this.updateSubscriptionStatus(subscriptionId, "canceled");
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case "invoice.payment_succeeded":
          const invoice = event.data.object as Stripe.Invoice;
          console.log("Payment succeeded for invoice:", invoice.id);
          await this.updateSubscriptionAndPaymentStatus(
            invoice,
            "active",
            "succeeded"
          );
          break;
        case "invoice.payment_failed":
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log("Payment failed for invoice:", failedInvoice.id);
          await this.updateSubscriptionAndPaymentStatus(
            failedInvoice,
            "past_due",
            "failed"
          );
          break;

        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          console.log("Subscription canceled:", subscription.id);
          await this.updateSubscriptionStatus(subscription.id, "canceled");
          break;

        case "invoice.payment_action_required":
          console.log(
            "Payment action required for invoice:",
            event.data.object.id
          );

          break;

        case "customer.updated":
          console.log("Customer updated:", event.data.object.id);
          break;
        case "payment_intent.requires_action":
          console.log("Payment intent requires action:", event.data.object.id);
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }
    } catch (error: any) {
      console.error("Error handling webhook:", error);
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  private async updateSubscriptionAndPaymentStatus(
    invoice: Stripe.Invoice,
    subscriptionStatus:
      | "active"
      | "canceled"
      | "past_due"
      | "pending"
      | "paused"
      | "not_started",
    paymentStatus: "succeeded" | "failed"
  ) {
    const subscriptionId = invoice.subscription as string;
    const paymentIntentId = invoice.payment_intent as string;

    console.log(invoice, subscriptionStatus, paymentStatus);
    await db.transaction(async (tx) => {
      const [id] = await tx
        .update(paymentTable)
        .set({ status: paymentStatus })
        .where(eq(paymentTable.providerPaymentId, paymentIntentId))
        .returning({
          id: paymentTable.subscriptionId,
        });

      const [userId] = await tx
        .update(subscriptionTable)
        .set({ status: subscriptionStatus })
        .where(eq(subscriptionTable.id, id.id))
        .returning({
          userId: subscriptionTable.userId,
        });

      if (paymentStatus === "succeeded" && subscriptionStatus === "active") {
        const [user] = await tx
          .update(userTable)
          .set({ role: "subscriber" })
          .where(eq(userTable.id, userId.userId))
          .returning({
            id: userTable.id,
            role: userTable.role,
          });
      }
    });

    console.log(
      `Updated subscription ${subscriptionId} and payment ${paymentIntentId}`
    );
  }

  private async updateSubscriptionStatus(
    subscriptionId: string,
    status: "canceled"
  ) {
    await db
      .update(subscriptionTable)
      .set({
        status: status,
        canceledAt: new Date(),
        endedAt: new Date(),
      })
      .where(eq(paymentTable.providerSubscriptionId, subscriptionId));

    console.log(`Updated subscription ${subscriptionId} status to ${status}`);
  }
}
