/**
 * Copyright (C) 2026
 * Licensed under the GPL-3.0 License;
 * You may not use this file except in compliance with the License.
 * It is supplied in the hope that it may be useful.
 *
 * @project_name Empire-Md
 * @author      efeurhobobullish <https://github.com/efeurhobobullish>
 * @description Empire-Md, a multi-functional WhatsApp bot.
 * @version     0.0.2
 */

// Database (MongoDB / PostgreSQL / JSON - auto-detected; stores are getters so they reflect connectDB())
const database = require("./database/index");

// Command system
const { cmd, commands, AddCommand, Function: Func, Module } = require("./command");

// Utilities (func.js)
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  saveConfig,
  Catbox,
  monospace,
  dBinary,
  eBinary,
} = require("./functions/func");

// Audio editor (default export = instance)
const audioEditor = require("./functions/audio-editor");

// Autoreact
const { doReact, emojis } = require("./functions/autoreact");

// Message helpers
const { sms, downloadMediaMessage } = require("./functions/msg");

// Exif / media
const {
  imageToWebp,
  webp2mp4,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExifWebp,
} = require("./functions/exif");

// Bugs (optional)
const { bug } = require("./bugs/bug");
const { bugUrl } = require("./bugs/bugUrl");

module.exports = {
  // Database (getters so stores update after connectDB())
  get card() {
    return database.card;
  },
  get chatbot() {
    return database.chatbot;
  },
  get sck() {
    return database.sck;
  },
  get notes() {
    return database.notes;
  },
  get plugindb() {
    return database.plugindb;
  },
  get sck1() {
    return database.sck1;
  },
  get warndb() {
    return database.warndb;
  },
  get RandomXP() {
    return database.RandomXP;
  },
  get games() {
    return database.games;
  },
  connectDB: database.connectDB,
  // Command system
  cmd,
  commands,
  AddCommand,
  Function: Func,
  Module,
  // Utilities
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  saveConfig,
  Catbox,
  monospace,
  dBinary,
  eBinary,
  // Media / exif
  imageToWebp,
  webp2mp4,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExifWebp,
  // Message
  sms,
  downloadMediaMessage,
  // Autoreact
  emojis,
  doReact,
  // Audio
  audioEditor,
  // Bugs
  bug,
  bugUrl,
};
