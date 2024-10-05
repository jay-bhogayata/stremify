import { Request, Response } from "express";
import { PaymentProviderFactory } from "../services/paymentProviderFactory";
import { User } from "../types";
import config from "../config";
import { getSubInfoByUserId } from "../database/models/subscription";
import { db } from "../database/connection";

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

/**
 * @openapi
 *   /api/v1/sub-info:
 *     get:
 *       summary: Get user subscription information
 *       tags: [Subscription]
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/getUserSubscriptionInfoResponse'
 *         '401':
 *           description: User not logged in
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: User not logged in
 *         '500':
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Internal server error
 * */
export const getUserSubscriptionInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not logged in" });
    }
    const userSubInfo = await getSubInfoByUserId(userId, db);

    res.json({ userSubInfo: userSubInfo });
  } catch (error) {
    console.error("Subscription info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
