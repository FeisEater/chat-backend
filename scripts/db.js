#!/usr/bin/env node

"use strict";

if (!process.env.NODE_ENV) {
  require("dotenv").config();
}
const db_methods = require("../db/methods");

/**
 * Logic for dynamic npm script "db"
 *
 * Parses the command as JSON from npm_config_argv.original
 * which stores them in a list eg. ["run", "db", "stuff"]
 * and calls database-methods as defined in switch-cases.
 */
const commands = JSON.parse(process.env.npm_config_argv).original;
if (commands.length > 2) {
  const command = commands[2];
  switch (command) {
    // case "create":
    //   db_methods.createTables()
    //   .then(() => {
    //     console.log("Tables created!");
    //     process.exit();
    //   })
    //   break;
    // case "drop":
    //   db_methods.dropTables()
    //   .then(() => {
    //     console.log("Tables dropped!");
    //     process.exit();
    //   })
    //   break;
    case "add":
      db_methods.addTestData()
      .then(() => {
        console.log("Data added!");
        process.exit();
      })
      .catch(err => {
        console.error("Adding test data to caused an error.");
        console.error(err);
        process.exit();
      });
      break;
    case "destroy":
      db_methods.destroyTables()
      .then(() => {
        console.log("Tables destroyed!");
        process.exit();
      })
      .catch(err => {
        console.error("Destroying tables caused an error.");
        console.error(err);
        process.exit();
      });
      break;
    case "reset":
      db_methods.resetTestData()
      .then(() => {
        console.log("Resetted the database with test data successfully!");
        process.exit();
      })
      .catch(err => {
        console.error("Resetting database caused an error.");
        console.error(err);
        process.exit();
      });
      break;
    // case "init":
    //   db_methods.dropAndCreateTables();
    //   break;
    case "dump":
      db_methods.dump()
      .then(data => {
        console.log(data);
        process.exit();
      })
      .catch(err => {
        console.error("Dumping data from database caused an error.");
        console.error(err);
        process.exit();
      });
      break;
    default:
      console.log(`Unknown command ${command}`);
      break;
  }
}
