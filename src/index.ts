import express, { Request, Response } from "express";
import config from "./config";
import router from "./routes";

import { logger, morganMiddleware } from "./utils/logger";
import metricsServer from "./utils/prom";

const app = express();

app.use(morganMiddleware);
app.use("/api/v1", router);

app.all("*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(config.PORT, () => {
  logger.info(`Server is running on http://localhost:${config.PORT}`);
});

metricsServer.listen(config.METRICS_PORT, () => {
  logger.info(
    `Metrics server is running on http://localhost:${config.METRICS_PORT}`
  );
});
