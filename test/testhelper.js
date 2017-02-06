if (!process.env.NODE_ENV) {
  require("dotenv").config();
}
const app = require("../app");

module.exports = {
  app,
};
