import { defineConfig } from "drizzle-kit";
import config from "./src/config/index";

export default defineConfig({
  schema: [
    "./src/database/models/user.ts",
    "./src/database/models/otp.ts",
    "./src/database/models/password_reset.ts",
  ],
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: config.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
