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

router.use("", auth.authenticate);

// Routes for all users

router.put("/user/:id", userCtrl.updateOne);
router.post("/room", roomCtrl.saveOne);
router.post("/room/:id/message", msgCtrl.saveOne);
router.post("/room/:id", roomCtrl.sendRoomPassword);
router.put("/room/:id", roomCtrl.editRoom);
router.get("/room/:id/member", roomCtrl.findMembers);
router.post("/room/:id/member", roomCtrl.setMember);
router.get("/user/:name", userCtrl.findByName);
router.put("/user/:id/block", userCtrl.blockUser);
router.get("/blockedusers", userCtrl.blockedUsers);
router.put("/user/:id/unblock", userCtrl.unblockUser);
router.put("/user", userCtrl.editProfile);

// Routes accessable only for admin

router.use("", auth.onlyAdmin);

router.get("/user", userCtrl.findAll);
router.delete("/user/:id", userCtrl.deleteOne);

router.use("", errorHandler.handleErrors);

module.exports = router;
