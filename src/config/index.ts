import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
};

if (!config.DATABASE_URL) {
  console.error(
    "No database connection string. Set DATABASE_URL environment variable."
  );
  process.exit(1);
}

export default config;
