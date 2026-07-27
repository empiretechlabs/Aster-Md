const mongoose = require('mongoose');

const options = {
  temp: { type: Object, default: {} },
};

const AliveSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, default: 'Aster-Md' },
  alive_text: {
    type: String,
    default:
      '*ι αм σηℓιηє нσω ¢αη ι нєℓρ уσυ* \n\n_ι αм ᴍυℓтι ԃєνιᴄє ωнαтѕαρρ вσт_ \n_Cʀєαtєd вყ : Empire Tech Labs_\n_If any query : wa.me/2348078582627_\n\n\n*_Update Alive Message by adding text with Alive_* \n*Eg: _.alive Your_Alive_Message_*',
  },
  alive_get: {
    type: String,
    default: "you did'nt set alive message yet\nType [.alive info] to get alive message information",
  },
  alive_url: { type: String, default: '' },
  alive_image: { type: Boolean, default: false },
  alive_video: { type: Boolean, default: false },
  antiviewonce: { type: String, default: 'true' },
  antidelete: { type: String, default: 'true' },
  levelup: { type: String, default: 'true' },
  anticall: { type: String, default: 'false' },
  autoreaction: { type: String, default: 'false' },
  permit: { type: Boolean, default: false },
  permit_values: { type: String, default: 'all' },
  chatbot: { type: String, default: 'false' },
  bgm: { type: Boolean, default: false },
  bgmarray: { type: Object, default: {} },
  plugins: { type: Object, default: {} },
  notes: { type: Object, default: {} },
  mention: { type: Object, default: {} },
  filter: { type: Object, default: { aster_: 'yes bruh?' } },
  setcmd: { type: Object, default: {} },
  language: { type: String, default: 'en' },
  afk: { type: Object, default: {} },
  ...options,
});

const alive = mongoose.model('alive', AliveSchema);

module.exports = { alive };
