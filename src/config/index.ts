import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SES_SENDER_EMAIL: process.env.AWS_SES_SENDER_EMAIL,
  OTP_EXPIRY_TIME_IN_MINUTES: process.env.OTP_EXPIRY_TIME_IN_MINUTES || 10,
  APP_ENV: process.env.APP_ENV || "dev",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    "E+RKQkiQTvaa3ClNDgRKgcMpugJkfiBLeroNINiNJms=",
  domain: process.env.DOMAIN,
  session_domain: process.env.SESSION_DOMAIN,
  db: {
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    ssl: process.env.DB_SSL === "require",
  },
  REDIS_URL: process.env.REDIS_URL,
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

export default config;
