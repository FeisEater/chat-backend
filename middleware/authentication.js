"use strict";

const TokenGenerator = require("../services/TokenGenerator");
const errors = require("../config/errors");

/**
 * Authentication middleware that is called before any requests
 *
 * Checks the request for the X-Access-Token header and then decodes
 * the token and checks if everything matches out after which
 * it lets the user to access the controller's method.
 */
module.exports.authenticate = (req, res, next) => {
  if (!req.headers["x-access-token"]) {
    throw new errors.AuthenticationError("Please make sure your request has X-Access-Token header.");
  }
  const decoded = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  if (decoded === undefined || decoded.name !== "login") {
    throw new errors.AuthenticationError("Invalid token.");
  }
  if (TokenGenerator.isTokenExpired(decoded)) {
    throw new errors.AuthenticationError("Your token has expired. Please re-login.");
  } else {
    req.user = decoded.user;
    next();
  }
};

module.exports.onlyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new errors.ForbiddenError("User admin permission check failed");
  }
};
