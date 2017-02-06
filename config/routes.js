"use strict";

const express = require("express");
const router = new express.Router();

const auth = require("../middleware/authentication");
const validate = require("../middleware/validateBody");
const errorHandler = require("../middleware/errorHandler");

const userCtrl = require("../controllers/user");
const roomCtrl = require("../controllers/room");
const msgCtrl = require("../controllers/message");

const authTest = (req, res) => {
  res.json({
    message: "You've successfully authenticated.",
  });
};

router.get("/room", roomCtrl.findAll);
router.get("/room/:id", roomCtrl.findOne);

router.get("/auth", auth.authenticate, authTest);

router.post("/login",
  validate.validateBody("user", "login"),
  userCtrl.loginUser);
router.post("/user",
  validate.validateBody("user", "save"),
  userCtrl.saveOne);

//router.use("", auth.authenticate);

// Routes for all users

router.put("/user/:id", auth.authenticate, userCtrl.updateOne);
router.post("/room", auth.authenticate, roomCtrl.saveOne);
router.post("/room/:id/message", auth.authenticate, msgCtrl.saveOne);
router.post("/room/:id", auth.authenticate, roomCtrl.sendRoomPassword);
router.put("/room/:id", auth.authenticate, roomCtrl.editRoom);
router.get("/room/:id/member", auth.authenticate, roomCtrl.findMembers);
router.post("/room/:id/member", auth.authenticate, roomCtrl.setMember);
router.get("/user/:name", auth.authenticate, userCtrl.findByName);
router.put("/user/:id/block", auth.authenticate, userCtrl.blockUser);
router.get("/blockedusers", auth.authenticate, userCtrl.blockedUsers);
router.put("/user/:id/unblock", auth.authenticate, userCtrl.unblockUser);
router.put("/user", auth.authenticate, userCtrl.editProfile);

// Routes accessable only for admin

//router.use("", auth.onlyAdmin);

//router.get("/user", userCtrl.findAll);
//router.delete("/user/:id", userCtrl.deleteOne);

router.use("", errorHandler.handleErrors);

module.exports = router;
