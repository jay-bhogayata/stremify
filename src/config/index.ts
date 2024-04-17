import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 8080,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  APP_ENV: process.env.APP_ENV || "dev",
  METRICS_PORT: process.env.METRICS_PORT || 9000,
  LOKI_HOST: process.env.LOKI_HOST || "http://loki:3100",
  JAEGER_HOST: process.env.JAEGER_HOST || "http://jaeger:4318/v1/traces",
};

export default config;
