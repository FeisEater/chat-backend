if (!process.env.NODE_ENV) {
  require("dotenv").config();
}
if (process.env.NODE_ENV !== "production") {
  process.exit(1);
}
