import config from "../config";
import { PaymentProvider } from "./PaymentProvider";
import { StripeProvider } from "./stripeProvider";

export class PaymentProviderFactory {
  static getPaymentProvider(paymentProviderName: string): PaymentProvider {
    switch (paymentProviderName) {
      case "stripe":
        if (config.STRIPE_SECRET_KEY === undefined) {
          throw new Error("Stripe secret key not defined in config");
        }
        return new StripeProvider(config.STRIPE_SECRET_KEY);

      default:
        throw new Error(`Unknown payment provider: ${paymentProviderName}`);
    }
  }
}
