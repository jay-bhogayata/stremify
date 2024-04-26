import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import router from "./routes";
import { morganMiddleware } from "./utils/logger";
import session from "express-session";
import { sessionConfig } from "./helpers/session.helper";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session(sessionConfig));
app.use(morganMiddleware);

app.use("/api/v1", router);

app.all("*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
