import config from "./config";
import app from "./server";

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
