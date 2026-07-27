const mongoose = require('mongoose');

const TempDbSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, default: 'Aster-Md' },
  creator: { type: String, default: 'Aster' },
  data: { type: Object, default: {} },
  sdb: { type: Object, default: {} },
});

const dbtemp = mongoose.model('dbtemp', TempDbSchema);

module.exports = { dbtemp };
