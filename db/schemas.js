const mongoose = require("./db_connection");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  created: { type: Date, default: Date.now },
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: "" },
  avatarFileType: { type: String, default: "" },
  blocked: [{type: Schema.Types.ObjectId, ref: "User"}]
});

const MembershipSchema = new Schema({
  created: { type: Date, default: Date.now },
  role: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  room: { type: Schema.Types.ObjectId, ref: "Room" }  
});

const MessageSchema = new Schema({
  created: { type: Date, default: Date.now },
  content: { type: String, required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room" },
  creator: { type: Schema.Types.ObjectId, ref: "User" }
});

const RoomSchema = new Schema({
  created: { type: Date, default: Date.now },
  name: { type: String, required: true },
  passwordHash: { type: String },
  messages: [{type: Schema.Types.ObjectId, ref: "Message"}],
  inviteonly: { type: Boolean, default: false },
  unlisted: { type: Boolean, default: false }
});

module.exports = {
  User: mongoose.model("User", UserSchema),
  Membership: mongoose.model("Membership", MembershipSchema),
  Message: mongoose.model("Message", MessageSchema),
  Room: mongoose.model("Room", RoomSchema),
};
