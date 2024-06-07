import config from "../config";

type CorsOptionsType = {
  [key: string]: {
    origin: string | undefined | boolean;
    methods: string[];
    allowedHeaders: string[];
    credentials?: boolean;
  };
};

export const corsOptions: CorsOptionsType = {
  dev: {
    origin: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
  },
  production: {
    origin: config.domain,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
  },
};
