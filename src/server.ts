import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import router from "./routes";
import { morganMiddleware } from "./utils/logger";
import session from "express-session";
import { rateLimiter } from "./utils/ratelimit";
import { session_config } from "./helpers/session.helper";
import cors from "cors";
import { corsOptions } from "./utils/corsConfig";

const app = express();

app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions[process.env.NODE_ENV || "production"]));
app.use(bodyParser.json());
app.use(session(session_config));
app.use(morganMiddleware);
app.use(rateLimiter);

app.use("/api/v1", router);

app.all("*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
