import postgres from "postgres";
import config from "../config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as user from "./models/user";
import * as otp from "./models/otp";
import * as passwordReset from "./models/password_reset";

const client = postgres(config.DATABASE_URL as string);

export const db = drizzle(client, {
  schema: {
    user,
    otp,
    passwordReset,
  },
});
