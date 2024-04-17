import express from "express";
import * as client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();

collectDefaultMetrics({ register });

const metricsServer = express();

metricsServer.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  const metrics = await register.metrics();
  res.send(metrics);
});

export default metricsServer;
