"use strict";

const Message = require("../models/Message");
const Room = require("../models/Room");
const Membership = require("../models/Membership");

const errors = require("../config/errors");

const TokenGenerator = require("../services/TokenGenerator");
const RoomPermission = require("../services/RoomPermission");
const ForbiddenError = require("../config/errors").ForbiddenError;

module.exports.saveOne = (req, res, next) => {
  var addedMsg = req.body;
  addedMsg.room = req.params.id;
  var savedMsg;
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  var retrievedMembership;
  
  Promise.resolve()
  .then(() => {
    return Membership.findOne({
      user: decode.user.id,
      room: addedMsg.room
    });
  })
  .then(membership => {
    retrievedMembership = membership;
    return Room.findById(addedMsg.room);
  })
  .then(room => {
    var error = RoomPermission.validateMembership(retrievedMembership, room, decode);
    if (error != "") {
      throw new ForbiddenError(error);
    }
    addedMsg.creator = decode.user.id;
    return Message.saveOne(addedMsg);
  })
  .then(message => {
    savedMsg = message;
    return Room.pushById(
      {messages: message},
      message.room
    );
  })
  .then(room => {
    res.status(200).send(savedMsg);
  })
  .catch(err => {
    console.log(err);
    next(err);
  });
};