import express, { Request, Response } from "express";
import router from "./routes";

const app = express();

app.use("/api/v1", router);

app.all("*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
