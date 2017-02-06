"use strict";

const BaseModel = require("./BaseModel");

class Message extends BaseModel {
  constructor() {
    super("Message");
  }
}

module.exports = new Message();
