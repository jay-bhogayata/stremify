import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SES_SENDER_EMAIL: process.env.AWS_SES_SENDER_EMAIL,
};

function checkEnvVariable(name: string, value: string | undefined) {
  if (!value) {
    console.error(`No ${name}. Set ${name} environment variable.`);
    process.exit(1);
  }
}

checkEnvVariable("DATABASE_URL", config.DATABASE_URL);
checkEnvVariable("AWS_REGION", config.AWS_REGION);
checkEnvVariable("AWS_ACCESS_KEY", config.AWS_ACCESS_KEY);
checkEnvVariable("AWS_SECRET_ACCESS_KEY", config.AWS_SECRET_ACCESS_KEY);
checkEnvVariable("AWS_SES_SENDER_EMAIL", config.AWS_SES_SENDER_EMAIL);

export default config;
