import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import router from "./routes";
import { morganMiddleware } from "./utils/logger";
import session from "express-session";
import { rateLimiter } from "./utils/ratelimit";
import { session_config } from "./helpers/session.helper";
import cors from "cors";
import { corsOptions } from "./utils/corsConfig";
import config from "./config";
import { apiReference } from "@scalar/express-api-reference";
import { swaggerDocs } from "./swagger";
import Stripe from "stripe";
import { PaymentProviderFactory } from "./services/paymentProviderFactory";

export const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions[config.APP_ENV || "production"]));
app.use(session(session_config));
app.use(morganMiddleware);
app.use(rateLimiter);

const webhookRouter = express.Router();

webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),

  (req: Request, res: Response) => {
    if (config.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20",
      });

      let event;
      try {
        const sig = req.headers["stripe-signature"];
        if (sig) {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            config.STRIPE_WEBHOOK_SECRET || ""
          );
          const provider = PaymentProviderFactory.getPaymentProvider("stripe");
          provider.handleWebhook(event);
          res.json({ received: true });
        } else {
          console.log("sig is not defended");
          res.status(400);
        }
      } catch (error) {
        console.error(error);
        res.status(500);
      }
    } else {
      res.status(400);
    }
  }
);
app.use("/api/v1/webhooks", webhookRouter);
app.use(express.json());
app.use(bodyParser.json());
app.use("/api/v1", router);

app.use(
  "/docs",
  apiReference({
    theme: "bluePlanet",
    spec: {
      content: swaggerDocs,
    },
    metaData: {
      title: "Stremify API DOCS",
    },
    authentication: {
      apiKey: {
        token: "",
      },
    },
  })
);

app.all("*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
