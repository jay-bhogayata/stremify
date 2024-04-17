import { defineConfig } from "drizzle-kit";
import config from "./src/config/index";

export default defineConfig({
  schema: ["./src/database/schema/user.ts"],
  out: "./src/database/generated/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: config.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
