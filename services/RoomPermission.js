"use strict";

const TokenGenerator = require("./TokenGenerator");

class RoomPermission {
  constructor () {
  }
  validateMembership(retrievedMembership, room, roomToken) {
    if (retrievedMembership != null && retrievedMembership.role == "banned")
      return "user_banned";
    var allowedRoles = ["moderator", "invited"];
    if (room.inviteonly && allowedRoles.indexOf(retrievedMembership.role) == -1)
      return "user_not_invited";
    if (room.passwordHash != null && room.passwordHash != "") {
      if (roomToken == null || roomToken.rooms == null)
        return "password_required";
      if (roomToken.rooms.indexOf(room.id) == -1)
        return "password_required";
    }
    return "";
  }
}

module.exports = new RoomPermission();
module.exports.class = RoomPermission;
