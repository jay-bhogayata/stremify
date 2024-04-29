import config from "../config";

type CorsOptionsType = {
  [key: string]: {
    origin: string | undefined;
    methods: string[];
    allowedHeaders: string[];
  };
};

export const corsOptions: CorsOptionsType = {
  development: {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
  },
  production: {
    origin: config.domain,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
  },
};
