const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  bot: { type: Boolean, default: false },
  announcement: { type: String, default: "" },
  permit: { type: String, default: "false" },
  afk: { type: String, default: "false" },
  afktime: { type: Number, default: 0 },
  times: { type: Number, default: 0 },
  ban: { type: String, default: "false" },
  haig: { type: String, default: "false" },
  anticall: { type: String, default: "false" },
  antidelete: { type: String, default: "false" },
  antivv: { type: String, default: "false" },
  autobio: { type: String, default: "false" },
  autobio_type: { type: String, default: "quote" },
  autoreact: { type: String, default: "false" } 
}, { timestamps: true });

const sck1 = mongoose.model("Sck1", UserSchema);
module.exports = { sck1 };