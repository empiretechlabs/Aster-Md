/**
 * PostgreSQL adapter - used when DATABASE_URL is set.
 * Creates tables for all collections and provides Mongoose-like API.
 */

const { Client } = require("pg");

let client = null;

const TABLE_DEFS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT DEFAULT '',
      bot BOOLEAN DEFAULT false,
      announcement TEXT DEFAULT '',
      permit TEXT DEFAULT 'false',
      afk TEXT DEFAULT 'false',
      afktime BIGINT DEFAULT 0,
      times INT DEFAULT 0,
      ban TEXT DEFAULT 'false',
      haig TEXT DEFAULT 'false',
      anticall TEXT DEFAULT 'false',
      antidelete TEXT DEFAULT 'false',
      antivv TEXT DEFAULT 'false',
      autobio TEXT DEFAULT 'false',
      autobio_type TEXT DEFAULT 'quote',
      autoreact TEXT DEFAULT 'false',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `,
  groups: `
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      events TEXT DEFAULT 'false',
      nsfw TEXT DEFAULT 'false',
      welcome TEXT DEFAULT '@pp *Hi,* @user \n*Welcome in* @gname \n*Member count* : @count th',
      goodbye TEXT DEFAULT '@pp *Another one bits dust.*\nUser: @user',
      botenable TEXT DEFAULT 'true',
      antilink TEXT DEFAULT 'false',
      antifake TEXT DEFAULT 'false',
      antitag TEXT DEFAULT 'off',
      economy TEXT DEFAULT 'false',
      mute TEXT,
      unmute TEXT
    )
  `,
  cards: `
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT DEFAULT 'empfork',
      count TEXT DEFAULT '0'
    )
  `,
  chatbots: `
    CREATE TABLE IF NOT EXISTS chatbots (
      id TEXT PRIMARY KEY,
      worktype TEXT DEFAULT 'false'
    )
  `,
  notes: `
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      note TEXT DEFAULT 'false'
    )
  `,
  plugins: `
    CREATE TABLE IF NOT EXISTS plugins (
      id TEXT PRIMARY KEY,
      url TEXT
    )
  `,
  warns: `
    CREATE TABLE IF NOT EXISTS warns (
      id TEXT NOT NULL,
      reason TEXT DEFAULT 'No Reason',
      date TEXT,
      "group" TEXT DEFAULT 'In Private chat',
      warnedby TEXT DEFAULT 'false',
      _rowid SERIAL PRIMARY KEY
    )
  `,
  xp: `
    CREATE TABLE IF NOT EXISTS xp (
      level TEXT DEFAULT 'false',
      _rowid SERIAL PRIMARY KEY
    )
  `,
  games: `
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      state TEXT DEFAULT '{}'
    )
  `,
};

function rowToDoc(row, collectionName) {
  if (!row) return null;
  const doc = { ...row };
  const pk = collectionName === "warns" ? "_rowid" : "id";
  doc.save = async function () {
    const cols = Object.keys(doc).filter((k) => k !== "save" && k !== "_rowid" && doc[k] !== undefined);
    const set = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
    const values = cols.map((c) => doc[c]);
    const pkVal = doc[pk];
    await client.query(
      `UPDATE ${collectionName} SET ${set} WHERE ${pk} = $${cols.length + 1}`,
      [...values, pkVal]
    );
    return doc;
  };
  return doc;
}

function createPgStore(collectionName, idField = "id") {
  return {
    async findOne(query) {
      if (!client) return null;
      const keys = Object.keys(query || {});
      const values = Object.values(query || {});
      const where = keys.length ? keys.map((k, i) => `"${k}" = $${i + 1}`).join(" AND ") : "1=1";
      const res = await client.query(
        `SELECT * FROM ${collectionName} WHERE ${where} LIMIT 1`,
        values
      );
      const row = res.rows[0];
      return rowToDoc(row ? { ...row } : null, collectionName);
    },

    async find(query = {}) {
      if (!client) return [];
      const keys = Object.keys(query);
      const where = keys.length ? keys.map((k, i) => `"${k}" = $${i + 1}`).join(" AND ") : "1=1";
      const values = Object.values(query);
      const res = await client.query(`SELECT * FROM ${collectionName} WHERE ${where}`, values);
      return res.rows.map((r) => ({ ...r }));
    },

    async findOneAndUpdate(query, update, opts = {}) {
      if (!client) return null;
      const doc = await this.findOne(query);
      const merged = doc ? { ...doc, ...update } : { [idField]: query[idField], ...update };
      const cols = Object.keys(merged).filter((k) => k !== "save");
      if (doc) {
        const set = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
        await client.query(
          `UPDATE ${collectionName} SET ${set} WHERE "${idField}" = $${cols.length + 1}`,
          [...cols.map((c) => merged[c]), query[idField]]
        );
      } else if (opts.upsert !== false) {
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const names = cols.map((c) => `"${c}"`).join(", ");
        await client.query(
          `INSERT INTO ${collectionName} (${names}) VALUES (${placeholders})`,
          cols.map((c) => merged[c])
        );
      }
      return opts.new !== false ? merged : doc;
    },

    async updateOne(query, update) {
      if (!client) return { modifiedCount: 0 };
      const cols = Object.keys(update);
      const set = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
      const whereKeys = Object.keys(query);
      const where = whereKeys.map((k, i) => `"${k}" = $${cols.length + i + 1}`).join(" AND ");
      const res = await client.query(
        `UPDATE ${collectionName} SET ${set} WHERE ${where}`,
        [...Object.values(update), ...Object.values(query)]
      );
      return { modifiedCount: res.rowCount || 0 };
    },

    async create(doc) {
      if (!client) return doc;
      const cols = Object.keys(doc);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      const names = cols.map((c) => `"${c}"`).join(", ");
      await client.query(
        `INSERT INTO ${collectionName} (${names}) VALUES (${placeholders})`,
        cols.map((c) => doc[c])
      );
      return doc;
    },

    async deleteMany(query) {
      if (!client) return { deletedCount: 0 };
      const keys = Object.keys(query || {});
      const where = keys.length ? keys.map((k, i) => `"${k}" = $${i + 1}`).join(" AND ") : "1=1";
      const res = await client.query(
        `DELETE FROM ${collectionName} WHERE ${where}`,
        Object.values(query || {})
      );
      return { deletedCount: res.rowCount || 0 };
    },
  };
}

async function initPostgres(connectionString) {
  client = new Client({ connectionString });
  await client.connect();
  for (const [name, sql] of Object.entries(TABLE_DEFS)) {
    await client.query(sql);
  }
  return {
    sck1: createPgStore("users"),
    sck: createPgStore("groups"),
    card: createPgStore("cards"),
    chatbot: createPgStore("chatbots"),
    notes: createPgStore("notes"),
    plugindb: createPgStore("plugins"),
    warndb: createPgStore("warns"),
    RandomXP: createPgStore("xp"),
    games: createPgStore("games"),
  };
}

module.exports = { initPostgres };
