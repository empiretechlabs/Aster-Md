/**
 * JSON database adapter (LowDB) - used when no MongoDB or PostgreSQL URL is set.
 * Provides Mongoose-like API: findOne, find, findOneAndUpdate, updateOne, create, deleteMany.
 */

const path = require("path");
const fs = require("fs-extra");

const DB_DIR = path.resolve(__dirname, "../../../database");
const DEFAULT_DATA = {
  users: [],
  groups: [],
  cards: [],
  chatbots: [],
  notes: [],
  plugins: [],
  warns: [],
  xp: [],
  games: [],
};

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function loadCollection(name) {
  ensureDbDir();
  const file = path.join(DB_DIR, `${name}.json`);
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(DEFAULT_DATA[name]) ? [] : DEFAULT_DATA[name];
}

function saveCollection(name, data) {
  ensureDbDir();
  const file = path.join(DB_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function match(doc, query) {
  if (!query || typeof query !== "object") return true;
  for (const [k, v] of Object.entries(query)) {
    if (doc[k] !== v) return false;
  }
  return true;
}

function docWithSave(collectionName, doc, index) {
  if (!doc) return null;
  const d = { ...doc };
  d.save = async function () {
    const data = loadCollection(collectionName);
    if (index >= 0 && index < data.length) {
      data[index] = { ...data[index], ...d };
      saveCollection(collectionName, data);
    }
    return d;
  };
  return d;
}

function createStore(collectionName, idField = "id") {
  return {
    async findOne(query) {
      const data = loadCollection(collectionName);
      const index = data.findIndex((doc) => match(doc, query));
      const doc = index >= 0 ? data[index] : null;
      return docWithSave(collectionName, doc, index);
    },

    async find(query = {}) {
      const data = loadCollection(collectionName);
      const list = query && Object.keys(query).length ? data.filter((doc) => match(doc, query)) : data;
      return list;
    },

    async findOneAndUpdate(query, update, opts = {}) {
      const data = loadCollection(collectionName);
      const index = data.findIndex((doc) => match(doc, query));
      const upsert = opts.upsert !== false;
      let doc;
      if (index >= 0) {
        doc = { ...data[index], ...(typeof update === "function" ? update(data[index]) : update) };
        data[index] = doc;
      } else if (upsert) {
        doc = { [idField]: query[idField], ...update };
        data.push(doc);
      } else {
        return null;
      }
      saveCollection(collectionName, data);
      return opts.new !== false ? doc : data[index];
    },

    async updateOne(query, update) {
      const data = loadCollection(collectionName);
      const index = data.findIndex((doc) => match(doc, query));
      if (index < 0) return { modifiedCount: 0 };
      const u = typeof update === "object" && !Array.isArray(update) ? update : {};
      data[index] = { ...data[index], ...u };
      saveCollection(collectionName, data);
      return { modifiedCount: 1 };
    },

    async create(doc) {
      const data = loadCollection(collectionName);
      const d = { ...doc };
      data.push(d);
      saveCollection(collectionName, data);
      return d;
    },

    async deleteMany(query) {
      const data = loadCollection(collectionName);
      const before = data.length;
      const filtered = query && Object.keys(query).length ? data.filter((doc) => !match(doc, query)) : [];
      const deleted = before - filtered.length;
      if (deleted > 0) saveCollection(collectionName, filtered);
      return { deletedCount: deleted };
    },
  };
}

function initJsonStores() {
  ensureDbDir();
  return {
    sck1: createStore("users"),
    sck: createStore("groups"),
    card: createStore("cards"),
    chatbot: createStore("chatbots"),
    notes: createStore("notes"),
    plugindb: createStore("plugins"),
    warndb: createStore("warns"),
    RandomXP: createStore("xp"),
    games: createStore("games"),
  };
}

module.exports = { initJsonStores };
