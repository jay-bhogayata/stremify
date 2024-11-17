import { defineConfig, Config } from "drizzle-kit";
import config from "./src/config/index";

export default defineConfig({
  schema: [
    "./src/database/models/user.ts",
    "./src/database/models/otp.ts",
    "./src/database/models/password_reset.ts",
    "./src/database/models/movie.ts",
    "./src/database/models/subscription.ts",
  ],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: config.db.host,
    port: Number(config.db.port),
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: "require",
  },
  verbose: true,
  strict: true,
});
