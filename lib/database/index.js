/**
 * Database layer: auto-detects MongoDB, PostgreSQL, or JSON (no URL).
 * Exports connectDB() and store getters (sck1, sck, card, etc.) with a unified API.
 */

const mongoose = require("mongoose");

let _stores = null;

function getStores() {
  if (global.__DB_STORES) return global.__DB_STORES;
  if (!_stores) {
    const { initJsonStores } = require("./adapters/json");
    _stores = initJsonStores();
    global.__DB_STORES = _stores;
  }
  return _stores;
}

async function connectDB() {
  const config = require("../../config");
  const mongoUrl = (config.MONGODB_URL || "").trim();
  const databaseUrl = (config.DATABASE_URL || "").trim();
  // Auto-detect from URL only: MongoDB URL → mongo; DATABASE_URL → postgres; else JSON
  const type = mongoUrl ? "mongodb" : databaseUrl ? "postgres" : "json";

  if (type === "mongodb") {
    await mongoose.connect(mongoUrl);
    global.__DB_STORES = {
      sck1: require("./user").sck1,
      sck: require("./group").sck,
      card: require("./cards").card,
      chatbot: require("./chatbot").chatbot,
      notes: require("./notes").notes,
      plugindb: require("./plugins").plugindb,
      warndb: require("./warn").warndb,
      RandomXP: require("./xp").RandomXP,
      games: require("./games").games,
    };
    console.log("🌍 Database: MongoDB (auto-detected)");
    return type;
  }

  if (type === "postgres") {
    const { initPostgres } = require("./adapters/postgres");
    global.__DB_STORES = await initPostgres(databaseUrl);
    console.log("🌍 Database: PostgreSQL (auto-detected, tables created/verified)");
    return type;
  }

  const { initJsonStores } = require("./adapters/json");
  global.__DB_STORES = initJsonStores();
  console.log("🌍 Database: JSON (auto-detected, no URL set)");
  return type;
}

module.exports = {
  connectDB,
  get sck1() {
    return getStores().sck1;
  },
  get sck() {
    return getStores().sck;
  },
  get card() {
    return getStores().card;
  },
  get chatbot() {
    return getStores().chatbot;
  },
  get notes() {
    return getStores().notes;
  },
  get plugindb() {
    return getStores().plugindb;
  },
  get warndb() {
    return getStores().warndb;
  },
  get RandomXP() {
    return getStores().RandomXP;
  },
  get games() {
    return getStores().games;
  },
};
