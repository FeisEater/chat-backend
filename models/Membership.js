"use strict";

const BaseModel = require("./BaseModel");

class Membership extends BaseModel {
  constructor() {
    super("Membership");
  }
}

module.exports = new Membership();
