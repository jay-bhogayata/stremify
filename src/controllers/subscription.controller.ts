import { Request, Response } from "express";
import { PaymentProviderFactory } from "../services/paymentProviderFactory";
import { User } from "../types";
import config from "../config";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as { user?: { id: string } }).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const planId = config.STRIPE_PLAN_ID || "";

    const provider = PaymentProviderFactory.getPaymentProvider("stripe");
    const clientSecret = await provider.createSubscription(
      planId,
      req.session?.user as User
    );

    res.json({ clientSecret });
  } catch (error) {
    console.error("Subscription creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
