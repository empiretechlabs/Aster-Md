const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  state: { type: String, default: "{}" },
}, { timestamps: true });

const games = mongoose.model("Game", GameSchema);
module.exports = { games };
