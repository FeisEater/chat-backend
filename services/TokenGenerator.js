"use strict";

const jwt = require("jwt-simple");

class TokenGenerator {
  constructor(secret) {
    this.secret = secret;
  }
  decodeToken(token) {
    let decoded;
    try {
      decoded = jwt.decode(token, this.secret);
    } catch (e) {
      decoded = undefined;
    }
    return decoded;
  }
  isTokenExpired(decodedToken) {
    return new Date() > decodedToken.expires;
  }
  generateLoginToken(user) {
    const date = new Date();
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        blocked: user.blocked
      },
      rooms: [],
      name: "login",
      created: new Date(),
      expires: date.setDate(date.getDate() + 1),
    };
    return jwt.encode(payload, this.secret);
  }
  generateRoomToken(room) {
    const date = new Date();
    const payload = {
      rooms: [room.id],
      name: "room",
      created: new Date(),
      expires: date.setDate(date.getDate() + 1),
    };
    return jwt.encode(payload, this.secret);
  }
  reEncodeToken(token) {
    return jwt.encode(token, this.secret);
  }
}

module.exports = new TokenGenerator(process.env.TOKEN_SECRET);
module.exports.class = TokenGenerator;
