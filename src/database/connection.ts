import postgres from "postgres";
import config from "../config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as user from "./models/user";
import * as otp from "./models/otp";
import * as passwordReset from "./models/password_reset";
import { sql } from "drizzle-orm";
import { logger } from "../utils/logger";

export const db = drizzle(postgres(config.DATABASE_URL as string), {
  schema: {
    user,
    otp,
    passwordReset,
  },
});

export async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info("Connected to postgres database");
  } catch (err) {
    logger.error(`Failed to connect to database: ${(err as Error).message}`);
    throw new Error(`Failed to connect to database: ${(err as Error).message}`);
  }
}
checkDatabaseConnection();
