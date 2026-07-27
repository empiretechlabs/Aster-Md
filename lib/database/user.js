const mongoose = require('mongoose');

const options = {
  rank: { type: Object, default: {} },
};

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  permit: { type: String, default: 'false' },
  times: { type: Number, default: 0 },
  ban: { type: String, default: 'false' },
  warn: { type: Object, default: {} },
  language: { type: String, default: '' },
  ...options,
});

const sck1 = mongoose.model('Sck1', UserSchema);

module.exports = { sck1 };
