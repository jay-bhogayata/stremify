import morgan from "morgan";
import winston from "winston";
import config from "../config";
import LokiTransport from "winston-loki";
import { Response } from "express";

const { combine, errors, timestamp, json, colorize, align, printf } =
  winston.format;

let logger: winston.Logger;

if (config.APP_ENV === "dev") {
  logger = winston.createLogger({
    level: config.LOG_LEVEL || "info",
    format: combine(
      colorize({ all: true }),
      timestamp({
        format: "YYYY-MM-DD hh:mm:ss.SSS A",
      }),
      errors({ stack: true }),
      align(),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console()],
  });
} else {
  logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: combine(
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss A",
      }),
      json(),
      errors({ stack: true })
    ),
    transports: [
      new winston.transports.Console(),
      new LokiTransport({
        host: config.LOKI_HOST,
        labels: { app: "stremify-api" },
      }),
    ],
  });
}

morgan.token("level", function (_req, res: Response) {
  const status = res.statusCode;
  if (status < 400) {
    return "info";
  } else if (status < 500) {
    return "warn";
  } else {
    return "error";
  }
});

interface Logger {
  [key: string]: any;
}

const morganMiddleware = morgan(
  ":level :method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message: string) => {
        const level = message.split(" ")[0];
        (logger as Logger)[level](message.trim());
      },
    },
  }
);
export { logger, morganMiddleware };
