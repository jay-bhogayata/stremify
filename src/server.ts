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

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions[config.APP_ENV || "production"]));

app.use(bodyParser.json());
app.use(session(session_config));

app.use(morganMiddleware);
app.use(rateLimiter);

app.use("/api/v1", router);

app.use(
  "/docs",
  apiReference({
    theme: "bluePlanet",
    spec: {
      content: swaggerDocs,
    },
    metaData: {
      title: "./swagger.json",
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
