"use strict";

const BaseModel = require("./BaseModel");

class Room extends BaseModel {
  constructor() {
    super("Room");
  }
}

module.exports = new Room();
