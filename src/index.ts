import config from "./config";
import app from "./server";
import { logger } from "./utils/logger";

app.listen(config.PORT, () => {
  logger.info(`Server is running on http://localhost:${config.PORT}`);
});
