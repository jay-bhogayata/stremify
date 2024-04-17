import postgres from "postgres";
import config from "../config";
import { drizzle } from "drizzle-orm/postgres-js";
import user from "./schema/user";

const client = postgres(config.DATABASE_URL as string);

export const db = drizzle(client, {
  schema: {
    user,
  },
  logger: true,
});
