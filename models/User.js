"use strict";

const BaseModel = require("./BaseModel");

class User extends BaseModel {
  constructor() {
    super("User");
  }
}

module.exports = new User();
