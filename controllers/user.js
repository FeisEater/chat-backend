"use strict";

const TokenGenerator = require("../services/TokenGenerator");
const passwordHelper = require("../config/passwordHelper");

const User = require("../models/User");

const errors = require("../config/errors");

module.exports.findAll = (req, res, next) => {
  User
  .findAll()
  .then(users => {
    res.status(200).send(users);
  })
  .catch(err => next(err));
};

module.exports.updateOne = (req, res, next) => {
  const user = req.body;

  Promise.resolve()
  .then(() => {
    if (req.user.id.toString() !== req.params.id && req.user.role !== "admin") {
      throw new errors.ForbiddenError("Missing privileges to edit User.");
    } else if (req.user.id.toString() === req.params.id && !user.password) {
      throw new errors.BadRequestError("No password supplied.");
    } else if (req.user.id.toString() === req.params.id && user.newPassword && user.newPassword.length < 8) {
      throw new errors.BadRequestError("New password is under 8 characters.");
    } else {
      return User.findOne({ id: req.params.id });
    }
  })
  .then(foundUser => {
    if (!foundUser) {
      throw new errors.NotFoundError("No User found.");
    } else if (user.password && !passwordHelper.comparePassword(user.password, foundUser.passwordHash)) {
      throw new errors.AuthenticationError("Wrong password.");
    }
    const strippedUser = Object.assign({}, user);
    if (req.user.id.toString() === req.params.id) {
      delete strippedUser.role;
      if (user.newPassword) {
        strippedUser.passwordHash = passwordHelper.hashPassword(user.newPassword);
      }
    }
    return User.update(strippedUser, { id: req.params.id });
  })
  .then(rows => {
    res.sendStatus(200);
  })
  .catch(err => next(err));
};

module.exports.saveOne = (req, res, next) => {
  User
  .findOne({ email: req.body.email })
  .then(foundUser => {
    if (foundUser) {
      throw new errors.BadRequestError("User already exists with the same email.");
    } else {
      req.body.passwordHash = passwordHelper.hashPassword(req.body.password);
      return User.saveOne(req.body);
    }
  })
  .then(savedUser => {
    res.sendStatus(200);
  })
  .catch(err => next(err));
};

module.exports.deleteOne = (req, res, next) => {
  User
  .delete({ id: req.params.id })
  .then(deletedRows => {
    if (deletedRows !== 0) {
      res.sendStatus(200);
    } else {
      throw new errors.NotFoundError("No user found.");
    }
  })
  .catch(err => next(err));
};

module.exports.loginUser = (req, res, next) => {
  User
  .findOne({ email: req.body.email })
  .then(user => {
    if (!user) {
      throw new errors.NotFoundError("No user found with given email.");
    } else if (!passwordHelper.comparePassword(req.body.password, user.passwordHash)) {
      throw new errors.AuthenticationError("Incorrect password.");
    } else {
      const token = TokenGenerator.generateLoginToken(user);
      user.passwordHash = undefined;
      res.status(200).send({
        user,
        token,
      });
    }
  })
  .catch(err => next(err));
};

module.exports.findByName = (req, res, next) => {
  User.findOne({
    nickname: req.params.name
  })
  .then(user => {
    if (!user)
      user = {};
    res.status(200).send(user);
  })
  .catch(err => next(err));
};

module.exports.blockUser = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  decode.user.blocked.push(req.params.id);
  User.pushById({blocked: req.params.id}, decode.user.id)
  .then(user => {
    const token = TokenGenerator.reEncodeToken(decode);
    decode.user.avatar = user.avatar;
    decode.user.avatarFileType = user.avatarFileType;
    res.status(200).send({
      user: decode.user,
      token: token,
    });    
  })
  .catch(err => next(err));
};

module.exports.blockedUsers = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  User.findAll().where("_id").in(decode.user.blocked).select("nickname avatar avatarFileType")
  .then(users => {
    res.status(200).send(users);
  })
  .catch(err => next(err));
};

module.exports.unblockUser = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  decode.user.blocked.splice(decode.user.blocked.indexOf(req.params.id), 1);
  User.getModel().findByIdAndUpdate(decode.user.id, { $pull: {blocked: req.params.id} })
  .then(user => {
    const token = TokenGenerator.reEncodeToken(decode);
    decode.user.avatar = user.avatar;
    decode.user.avatarFileType = user.avatarFileType;
    res.status(200).send({
      user: decode.user,
      token: token,
    });    
  })
  .catch(err => next(err));
};

module.exports.editProfile = (req, res, next) => {
  var decode = TokenGenerator.decodeToken(req.headers["x-access-token"]);
  if (req.body.password != undefined && req.body.password != "") {
    req.body.passwordHash = passwordHelper.hashPassword(req.body.password);
  }
  delete req.body.password;
  User.updateById(req.body, decode.user.id)
  .then(user => {
    user = user.toObject();
    delete user.passwordHash;
    res.status(200).send(user);    
  })
  .catch(err => next(err));
};