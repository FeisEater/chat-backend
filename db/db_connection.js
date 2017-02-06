"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connection.on("connected", () => {
  console.log("Connected to " + process.env.DB_URL);
});

// If the connection throws an error
mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error: ", err);
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", () => {
  mongoose.connection.close(() => process.exit(0));
});

mongoose.connect(process.env.DB_URL);

module.exports = mongoose;
