"use strict";

function BadRequestError(message, details) {
  this.name = "BadRequestError";
  this.message = message || "Something went wrong";
  this.details = details || {};
  this.stack = (new Error()).stack;
  this.statusCode = 400;
}

BadRequestError.prototype = Object.create(Error.prototype);

function AuthenticationError(message, details) {
  this.name = "AuthenticationError";
  this.message = message || "Something went wrong";
  this.details = details || {};
  this.statusCode = 401;
  this.stack = (new Error()).stack;
}

AuthenticationError.prototype = Object.create(Error.prototype);

function ForbiddenError(message, details) {
  this.name = "ForbiddenError";
  this.message = message || "Something went wrong";
  this.details = details || {};
  this.statusCode = 403;
  this.stack = (new Error()).stack;
}

ForbiddenError.prototype = Object.create(Error.prototype);

function NotFoundError(message, details) {
  this.name = "NotFoundError";
  this.message = message || "Something went wrong";
  this.details = details || {};
  this.statusCode = 404;
  this.stack = (new Error()).stack;
}

NotFoundError.prototype = Object.create(Error.prototype);

module.exports = {
  BadRequestError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
};
