import dotenv from "dotenv";

dotenv.config();

interface Config {
  PORT: number;
  DATABASE_URL: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SES_SENDER_EMAIL: string;
  OTP_EXPIRY_TIME_IN_MINUTES: number;
  APP_ENV: string;
  LOG_LEVEL: string;
  SESSION_SECRET: string;
  DOMAIN?: string;
  SESSION_DOMAIN?: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  REDIS_URL: string;
  FRONTEND_URL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PLAN_ID?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_SES_SENDER_EMAIL: process.env.AWS_SES_SENDER_EMAIL || "",
  OTP_EXPIRY_TIME_IN_MINUTES:
    Number(process.env.OTP_EXPIRY_TIME_IN_MINUTES) || 10,
  APP_ENV: process.env.APP_ENV || "dev",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    "E+RKQkiQTvaa3ClNDgRKgcMpugJkfiBLeroNINiNJms=",
  DOMAIN: process.env.DOMAIN,
  SESSION_DOMAIN: process.env.SESSION_DOMAIN,
  db: {
    host: process.env.DB_HOST || "",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    ssl: process.env.DB_SSL === "require",
  },
  REDIS_URL: process.env.REDIS_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PLAN_ID: process.env.STRIPE_PLAN_ID || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
};

function checkEnvVariable(name: string, value: string | undefined) {
  if (!value && process.env.NODE_ENV !== "test") {
    console.error(`No ${name}. Set ${name} environment variable.`);
    process.exit(1);
  }
}

checkEnvVariable("DATABASE_URL", config.DATABASE_URL);
checkEnvVariable("AWS_REGION", config.AWS_REGION);
checkEnvVariable("AWS_ACCESS_KEY", config.AWS_ACCESS_KEY);
checkEnvVariable("AWS_SECRET_ACCESS_KEY", config.AWS_SECRET_ACCESS_KEY);
checkEnvVariable("AWS_SES_SENDER_EMAIL", config.AWS_SES_SENDER_EMAIL);
checkEnvVariable("redis url", config.REDIS_URL);
checkEnvVariable("STRIPE_SECRET_KEY", config.STRIPE_SECRET_KEY);
checkEnvVariable("STRIPE_PLAN_ID", config.STRIPE_PLAN_ID);
checkEnvVariable("STRIPE_WEBHOOK_SECRET", config.STRIPE_WEBHOOK_SECRET);
export default config;
