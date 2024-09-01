import { User } from "../types";

export interface PaymentProvider {
  createSubscription(planId: string, user: User): Promise<object>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  handleWebhook(event: any): Promise<void>;
}
