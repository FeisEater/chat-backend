"use strict";

const Room = require("../models/Room");
const Membership = require("../models/Membership");
const User = require("../models/User");

const errors = require("../config/errors");

const TokenGenerator = require("../services/TokenGenerator");
const RoomPermission = require("../services/RoomPermission");
const ForbiddenError = require("../config/errors").ForbiddenError;
const passwordHelper = require("../config/passwordHelper");

module.exports.findAll = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  if (decode == undefined) {
    decode = {user: {
      blocked: [],
    }}
  }
  var foundRooms;
  Room
  .findAll()
  .where("unlisted", false)
  .populate({
    path: "messages",
    select: "content created",
    match: {
      creator: { $nin: decode.user.blocked },      
    },
    options: {
      sort: { "created": -1 },
      limit: 5
    } 
  })
  .then(rooms => {
    foundRooms = rooms;
    if (decode == null)
      return [];
    var roomIds = [];
    rooms.forEach(function(room) {roomIds.push(room._id);});
    return Membership.findAll()
            .where("user").equals(decode.user.id)
            .where("room").in(roomIds);
  })
  .then(memberships => {
    foundRooms = foundRooms.map(function(r) {
      var room = r.toObject();
      var membership = null;
      memberships.forEach(function(mem){
        if (mem.room.toString() == room._id.toString()) {
          membership = mem;
        }
      });
      if (RoomPermission.validateMembership(membership, room, decode) != "") {
        room.messages = [];
        room["forbidden"] = true;
      }
      if (room.passwordHash != null && room.passwordHash != "") {
        room.passwordHash = "Exists";
      }
      room.messages.forEach(function (msg) {
        msg.content = msg.content.substring(0, 60);
      });
      return room;
    });
    res.status(200).send(foundRooms);
  })
  .catch(err => console.log(err));
};

module.exports.findOne = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  if (decode == undefined) {
    decode = {user: {
      blocked: [],
      id: null
    }}
  }
  var retrievedRoom;
  Room
  .findById(req.params.id)
  .populate({
    path: "messages",
    match: {
      creator: { $nin: decode.user.blocked },      
    },
    options: {
      sort: { "created": -1 },
      limit: 10
    },
    populate: {
      path: "creator",
      select: "nickname avatar avatarFileType",      
    }
  })
  .then(room => {
    retrievedRoom = room;
    return Membership.findOne({
      user: decode.user.id,
      room: room
    });
  })
  .then(membership => {
    var error = RoomPermission.validateMembership(membership, retrievedRoom, decode);
    if (error != "") {
      throw new ForbiddenError(error);
    }
    var isModerator = membership != null && membership.role != null && membership.role == "moderator";
    res.status(200).send({room: retrievedRoom, moderator: isModerator});
  })
  .catch(err => next(err));
};

module.exports.saveOne = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  var createdRoom;
  var token;
  var passwordProtected = false;
  if (req.body.password != undefined && req.body.password != "") {
    req.body.passwordHash = passwordHelper.hashPassword(req.body.password);
    passwordProtected = true;
  }
  delete req.body.password;
  Room
  .saveOne(req.body)
  .then(room => {
    createdRoom = room;
    if (passwordProtected) {
      token = TokenGenerator.generateRoomToken(room);
      if (decode != null) {
        decode.rooms.push(room.id);
        token = TokenGenerator.reEncodeToken(decode);        
      }
    }
    return Membership.saveOne({
      role: "moderator",
      user: decode.user.id,
      room: room._id
    });
  })
  .then(membership => {
    res.status(200).send({token: token, room: createdRoom});
  })
  .catch(err => console.log(err));
};

module.exports.editRoom = (req, res, next) => {
  if (req.body.password != undefined && req.body.password != "") {
    req.body.passwordHash = passwordHelper.hashPassword(req.body.password);
  }
  if (req.body.password == "") {
    req.body.passwordHash = "";
  }
  delete req.body.password;
  Room.updateById(req.body, req.params.id)
  .then(room => {
    res.status(200).send(room);    
  })
  .catch(err => next(err));
};

module.exports.sendRoomPassword = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  Room
  .findById(req.params.id)
  .then(room => {
    if (!passwordHelper.comparePassword(req.body.roomPassword, room.passwordHash))
      throw new errors.AuthenticationError("Incorrect password.");
    var token = TokenGenerator.generateRoomToken(room);
    if (decode != null) {
      decode.rooms.push(room.id);
      token = TokenGenerator.reEncodeToken(decode);        
    }
    res.status(200).send({token: token, room: room});
  })
  .catch(err => console.log(err));
};

module.exports.findMembers = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  var retrievedRoom;
  var moderators = [];
  var banned = [];
  var invited = [];
  var posters = [];
  Room
  .findById(req.params.id)
  .populate("messages", "creator")
  .then(room => {
    retrievedRoom = room;
    return Membership.findOne({
      user: decode.user.id,
      room: room
    });
  })
  .then(membership => {
    if (membership == null || membership.role != "moderator")
      throw new AuthenticationError("Have to be a moderator");
    return Membership.findAll()
            .where("room").equals(retrievedRoom._id)
            .where("role").in(["moderator", "banned", "invited"]);
  })
  .then(memberships => {
    memberships.forEach(member => {
      if (member.user != decode.user.id) {
        if (member.role == "moderator")
          moderators.push(member.user.toString());
        if (member.role == "banned")
          banned.push(member.user.toString());
        if (member.role == "invited")
          invited.push(member.user.toString());
      }
    });
    retrievedRoom.messages.forEach(msg => {
      var creator = msg.creator.toString();
      if (moderators.indexOf(creator) == -1 && banned.indexOf(creator) == -1 && invited.indexOf(creator) == -1 && decode.user.id != creator)
        posters.push(creator);
    });
    return User.findAll().where("_id").in(moderators);
  })
  .then(users => {
    moderators = users;
    return User.findAll().where("_id").in(banned);
  })
  .then(users => {
    banned = users;
    return User.findAll().where("_id").in(invited);
  })
  .then(users => {
    invited = users;
    return User.findAll().where("_id").in(posters);
  })
  .then(users => {
    posters = users;
    var data = {
      moderators: moderators,
      banned: banned,
      invited: invited,
      posters: posters
    };
    res.status(200).send(data);
  })
  .catch(err => next(err));
};

module.exports.setMember = (req, res, next) => {
  Membership.findOne({
    user: req.body.userId,
    room: req.params.id
  })
  .then(member => {
    if (!member) {
      return Membership.saveOne({
        role: req.body.role,
        user: req.body.userId,
        room: req.params.id
      });
    } else {
      member.role = req.body.role;
      return Membership.updateById(member, member._id);
    }
  })
  .then(member => {
    res.status(200).send(member);
  })
  .catch(err => next(err));
};