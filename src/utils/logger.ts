import morgan from "morgan";
import winston, { Logger } from "winston";
import config from "../config";
import { Response } from "express";

const { combine, errors, timestamp, json, colorize, align, printf } =
  winston.format;

let logger: Logger;

// TODO: for non dev environments, log to a file or any other log management system and use json format
logger = winston.createLogger({
  level: config.LOG_LEVEL || "info",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss A",
    }),
    errors({ stack: true }),
    align(),
    json(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

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

const morganMiddleware = morgan(
  ":level :method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message: string) => {
        const level = message.split(" ")[0];
        (logger as any)[level](message.trim());
      },
    },
  }
);

export { logger, morganMiddleware };
