const fs = require('fs');
const { Pool } = require('pg');
const { sck1 } = require(__dirname + '/database/user');
const { sck } = require(__dirname + '/database/group');
const { alive } = require(__dirname + '/database/alive');
const { dbtemp } = require(__dirname + '/database/tempdb');

let optJson = {
  bot_: {},
  sck1: { rank: {} },
  sck: {},
  tempdb: {},
};

let tableDefaults = {
  bot_: {
    id: 'Aster-Md',
    alive_text:
      '*HEY &user* \n*ι αм σηℓιηє нσω ¢αη ι нєℓρ уσυ* \n\n_ι αм ᴍυℓтι ԃєνιᴄє ωнαтѕαρρ вσт_ \n\n*_Update Alive Message by adding text with Alive_* \n*SUPPORT US https://youtube.com/empire_tech_labs*',
    alive_get: "you did'nt set alive message yet\nType [.alive info] to get alive info",
    alive_url: '',
    alive_image: false,
    alive_video: false,
    permit: false,
    permit_values: 'all',
    chatbot: 'false',
    antiviewonce: 'true',
    antidelete: 'true',
    levelup: 'false',
    anticall: 'true',
    autoreaction: 'false',
    bgm: false,
    bgmarray: {},
    plugins: {},
    notes: {},
    warn: {},
    language: 'en',
    afk: {},
    filter: {},
    setcmd: {},
    mention: {},
    ...(optJson.bot_ || {}),
  },
  sck: {
    id: 'Aster-Md',
    events: 'false',
    nsfw: 'false',
    pdm: 'false',
    antipromote: 'false',
    antidemote: 'false',
    welcome: 'false',
    goodbye: 'false',
    welcometext:
      '*@user @pp Welcome Bruhhh In @gname.....!!!!!😊👇🏻♥️* \n@desc\n\n *______________*\n  *Support us by Subscribing*\n@yt_channel',
    goodbyetext:
      '*@user @pp Left From @gname.....!!!!!😒👆🏻♥️* \n@desc\n *______________*\n  *Support us by Subscribing*\n@yt_channel',
    botenable: 'true',
    antilink: 'false',
    antiword: {},
    antifake: 'false',
    antispam: 'false',
    antitag: 'false',
    antibot: 'false',
    onlyadmin: 'false',
    economy: 'false',
    disablecmds: 'false',
    chatbot: 'false',
    mute: 'false',
    unmute: 'false',
    ...(optJson.sck || {}),
  },
  sck1: {
    id: 'chatid',
    name: 'Unknown',
    times: 0,
    permit: 'false',
    ban: 'false',
    language: '',
    warn: {},
    ...(optJson.sck1 || {}),
  },
  tempdb: {
    id: 'chatid',
    data: {},
    ...(optJson.tempdb || {}),
  },
};

let pgtables = {
  bot_: `
    CREATE TABLE IF NOT EXISTS bot_ (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Aster-Md',
      alive_text TEXT DEFAULT '*HEY &user* \n\n*ι αм σηℓιηє нσω ¢αη ι нєℓρ уσυ* \nι αм ᴍυℓтι ԃєνιᴄє ωнαтѕαρρ вσт \n\n*_Update Alive Message by adding text with Alive_* \n*SUPPORT US https://youtube.com/only_one_empire*',
      alive_get TEXT DEFAULT 'you didnt set alive message yet\n _https://github.com/efeurhobobullish/Aster-Md/wiki/alive_',
      alive_url VARCHAR(255) DEFAULT '',
      alive_image BOOLEAN DEFAULT false,
      alive_video BOOLEAN DEFAULT false,
      permit BOOLEAN DEFAULT false,
      permit_values VARCHAR(255) DEFAULT '212',
      chatbot VARCHAR(255) DEFAULT 'false',
      bgm BOOLEAN DEFAULT false,
      bgmarray JSON DEFAULT '{}',
      plugins JSON DEFAULT '{}',
      notes JSON DEFAULT '{}',
      antiviewonce VARCHAR(255) DEFAULT 'true',
      antidelete VARCHAR(255) DEFAULT 'true',
      levelup VARCHAR(255) DEFAULT 'true',
      autoreaction VARCHAR(255) DEFAULT 'true',
      anticall VARCHAR(255) DEFAULT 'true',
      mention JSON DEFAULT '{}',
      filter JSON DEFAULT '{}',
      afk JSON DEFAULT '{}',
      temp JSON DEFAULT '{}'
    );`,
  sck1: `
    CREATE TABLE IF NOT EXISTS sck1 (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Aster-Md',
      name VARCHAR(255) DEFAULT 'Unknown',
      times INTEGER DEFAULT 0,
      permit VARCHAR(255) DEFAULT 'false',
      ban VARCHAR(255) DEFAULT 'false',
      bot BOOLEAN DEFAULT false,
      msg JSON DEFAULT '{}',
      warn JSON DEFAULT '{}',
      rank JSON DEFAULT '{}'
    );`,
  sck: `
    CREATE TABLE IF NOT EXISTS Sck (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Aster-Md',
      events VARCHAR(255) DEFAULT 'false',
      nsfw VARCHAR(255) DEFAULT 'false',
      pdm VARCHAR(255) DEFAULT 'false',
      antipromote VARCHAR(255) DEFAULT 'false',
      antidemote VARCHAR(255) DEFAULT 'false',
      welcome VARCHAR(255) DEFAULT 'false',
      goodbye VARCHAR(255) DEFAULT 'false',
      welcometext TEXT DEFAULT '*@user @pp Welcome Bruhhh In @gname.....!!!!!😊👇🏻♥️* \n&context*MUST READ GROUP DESCRIPTION*\n@desc\n\n *______________*\n   *Support us by Subscribing*\n@yt_channel',
      goodbyetext TEXT DEFAULT '@user @pp Left From @gname.....!!!!!😒👆🏻♥️\n*MUST READ GROUP DESCRIPTION*\n@desc\n \n&context______________\nSupport us by Subscribing\n@yt_channel',
      botenable VARCHAR(255) DEFAULT 'true',
      antilink VARCHAR(255) DEFAULT 'false',
      antiword JSON DEFAULT '{}',
      antifake VARCHAR(255) DEFAULT 'false',
      antispam VARCHAR(255) DEFAULT 'false',
      antitag VARCHAR(255) DEFAULT 'false',
      antibot VARCHAR(255) DEFAULT 'false',
      onlyadmin VARCHAR(255) DEFAULT 'false',
      economy VARCHAR(255) DEFAULT 'false',
      disablecmds VARCHAR(255) DEFAULT 'false',
      chatbot VARCHAR(255) DEFAULT 'false',
      mute VARCHAR(255) DEFAULT 'false',
      unmute VARCHAR(255) DEFAULT 'false',
      disables TEXT[] DEFAULT ARRAY[]::TEXT[]
    );`,
  tempdb: `
    CREATE TABLE IF NOT EXISTS tempdb (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Aster-Md',
      data JSON DEFAULT '{}',
      creator TEXT DEFAULT 'Aster-SER'
    );`,
};


global.DATABASE_URL = global.DATABASE_URL || global.DATABASE_URI || process.env.DATABASE_URL;

let pool = null;
let sqldb = false;
const cacheTable = {};

const pg = {};

pg.connectPostgres = () => {
  pool = new Pool({
    connectionString: global.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.on('connect', () => {
    cacheTable.connectPostgres = true;
    sqldb = true;
    global.sqldb = true;
    return sqldb;
  });

  pool.on('error', () => {
    console.log('PostgreSQL database error:');
    setTimeout(pg.connectPostgres, 1000);
  });
};

pg.createTable = async (tableName) => {
  if ((!sqldb && !cacheTable.connectPostgres) || (!pool && global.sqldb)) {
    pg.connectPostgres();
  }
  if (cacheTable[tableName]) return true;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(pgtables[tableName]);
    if (tableName === 'bot_') {
      await client.query('ALTER TABLE bot_ ADD COLUMN IF NOT EXISTS setcmd JSON DEFAULT \'{}\'');
      await client.query("ALTER TABLE bot_ ADD COLUMN IF NOT EXISTS language VARCHAR(16) DEFAULT 'en'");
    }
    if (tableName === 'sck1') {
      await client.query("ALTER TABLE sck1 ADD COLUMN IF NOT EXISTS language VARCHAR(16) DEFAULT ''");
    }
    await client.query('COMMIT');
    if (!cacheTable[tableName]) {
      console.log(`PostgreSQL ${tableName} table created.`);
    }
    cacheTable[tableName] = true;
    return true;
  } catch (error) {
    console.log(`Error creating PostgreSQL ${tableName} table:`, error);
  } finally {
    client.release();
  }
};

pg.new = async (tableName, data) => {
  if (!(await pg.createTable(tableName))) return false;
  const client = await pool.connect();
  try {
    if (await pg.findOne(tableName, data)) {
      return pg.updateOne(tableName, { id: data?.id }, data);
    }
    await client.query('BEGIN');
    const keys = Object.keys(data);
    const query = `
      INSERT INTO ${tableName} (${keys.join(', ')})
      VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')})
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;
    const result = await client.query(query, Object.values(data));
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(`Error inserting into ${tableName}:`, error);
  } finally {
    client.release();
  }
};

pg.countDocuments = async (tableName) => {
  if (!(await pg.createTable(tableName))) return 0;
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count, 10);
  } catch {
    return 0;
  } finally {
    client.release();
  }
};

pg.findOne = async (tableName, query) => {
  if (!(await pg.createTable(tableName))) return false;
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [query?.id]);
    return result.rows[0];
  } catch (error) {
    console.log(`Error finding ${tableName} by id ${query?.id}:`, error);
    return false;
  } finally {
    client.release();
  }
};

pg.find = async (tableName, query = {}) => {
  if (!(await pg.createTable(tableName))) return [];
  const client = await pool.connect();
  try {
    if (!Object.values(query)[0]) {
      return (await client.query(`SELECT * FROM ${tableName}`))?.rows || [];
    }
    if (query?.id) {
      const row = await pg.findOne(tableName, query);
      return row ? [{ ...row }] : [];
    }
    return [];
  } catch (error) {
    console.log(`Error finding ${tableName} documents:`, error);
    return [];
  } finally {
    client.release();
  }
};

pg.updateOne = async (tableName, filter, update = {}) => {
  if (!(await pg.createTable(tableName))) return false;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingRow = await client.query(`SELECT * FROM ${tableName} WHERE id = $1 FOR UPDATE`, [filter?.id]);
    if (existingRow.rows[0]) {
      const keys = Object.keys(update);
      const updateQuery = `UPDATE ${tableName} SET ${keys.map((k, i) => `${k} = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING *;`;
      const result = await client.query(updateQuery, [filter.id, ...Object.values(update)]);
      await client.query('COMMIT');
      return result.rows[0];
    }
    return pg.new(tableName, { ...filter, ...update });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating ${tableName} id ${filter?.id}:`, error);
    return [];
  } finally {
    client.release();
  }
};

pg.findOneAndDelete = async (tableName, filter) => {
  if (!(await pg.createTable(tableName))) return false;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingRow = await client.query(`SELECT * FROM ${tableName} WHERE id = $1 FOR UPDATE`, [filter?.id]);
    if (existingRow.rows[0]) {
      const deleteResult = await client.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [filter.id]);
      await client.query('COMMIT');
      return deleteResult.rows[0];
    }
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error deleting ${tableName} id ${filter?.id}:`, error);
    return false;
  } finally {
    client.release();
  }
};

pg.collection = {
  drop: async (tableName) => {
    if (!(await pg.createTable(tableName))) return false;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DROP TABLE IF EXISTS ${tableName}`);
      await client.query('COMMIT');
      delete cacheTable[tableName];
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error dropping ${tableName}:`, error);
      return false;
    } finally {
      client.release();
    }
  },
};



let dbs = {
  newtables: tableDefaults,
  loadGroupData: async (filename) => {
    try {
      return fs.existsSync(__dirname + '/database/' + filename + '.json')
        ? JSON.parse(fs.readFileSync(__dirname + '/database/' + filename + '.json', 'utf8'))
        : (fs.writeFileSync(__dirname + '/database/' + filename + '.json', JSON.stringify({}, null, 2), 'utf8'), {});
    } catch (error) {
      console.error('Error loading data:', error);
      return {};
    }
  },
  saveGroupData: async (filename, data = {}) => {
    fs.writeFileSync(__dirname + '/database/' + filename + '.json', JSON.stringify(data, null, 2), 'utf8');
  },

  countDocuments: async (collection) => {
    try {
      const data = await dbs.loadGroupData(collection);
      return Object.keys(data).length;
    } catch (error) {
      console.log(`Error countDocuments ${collection}:`, error);
      return 0;
    }
  },

  new: async (collection, data) => {
    try {
      const existingData = await dbs.loadGroupData(collection);
      if (existingData[data.id]) return existingData[data.id];
      existingData[data.id] = { ...dbs.newtables[collection], ...data };
      await dbs.saveGroupData(collection, existingData);
      return existingData[data.id];
    } catch (error) {
      console.log(`Error creating ${collection}:`, error);
      return {};
    }
  },

  findOne: async (collection, query) => {
    try {
      const data = await dbs.loadGroupData(collection);
      return data[query.id];
    } catch (error) {
      console.log(`Error findOne ${collection}:`, error);
    }
  },

  find: async (collection, query = {}) => {
    try {
      const data = await dbs.loadGroupData(collection);
      if (data[query.id]) return [{ ...data[query.id] }];
      if (!Object.values(query)[0]) return Object.values(data);
      return [];
    } catch (error) {
      console.log(`Error find ${collection}:`, error);
      return [];
    }
  },

  updateOne: async (collection, filter, update = {}) => {
    try {
      const data = await dbs.loadGroupData(collection);
      if (data[filter.id]) {
        data[filter.id] = { ...data[filter.id], ...update };
        await dbs.saveGroupData(collection, data);
        return data[filter.id];
      }
      return dbs.new(collection, { ...filter, ...update });
    } catch (error) {
      console.log(`Error updateOne ${collection}:`, error);
      return {};
    }
  },

  findOneAndDelete: async (collection, filter) => {
    try {
      const data = await dbs.loadGroupData(collection);
      delete data[filter.id];
      await dbs.saveGroupData(collection, data);
      return true;
    } catch (error) {
      console.log(`Error findOneAndDelete ${collection}:`, error);
      return null;
    }
  },
};

dbs.delete = dbs.findOneAndDelete;
dbs.collection = {
  drop: async (collection) => {
    try {
      await dbs.saveGroupData(collection, {});
      return true;
    } catch (error) {
      console.log(`Error dropping ${collection}:`, error);
      return null;
    }
  },
};
dbs.deleteAll = dbs.collection.drop;



function _createStore({ model, collection, pg, dbs, label = collection }) {
  const allowed = () => global.SmdOfficial;
  const useMongo = () => global.isMongodb;
  const usePg = () => sqldb && pg;

  const store = {
    countDocuments: async () => {
      try {
        if (!allowed()) return;
        if (useMongo()) return await model.countDocuments();
        return usePg() ? await pg.countDocuments(collection) : await dbs.countDocuments(collection);
      } catch (error) {
        console.log(`Error ${label}.countDocuments():`, error);
        return 0;
      }
    },

    new: async (data) => {
      try {
        if (!allowed()) return;
        if (useMongo()) {
          return (
            (await model.findOne({ id: data.id })) ||
            (await new model({ id: data.id, ...data }).save())
          );
        }
        if (usePg()) {
          return (await pg.findOne(collection, { id: data.id })) || (await pg.new(collection, data));
        }
        return (await dbs.findOne(collection, { id: data.id })) || (await dbs.new(collection, data));
      } catch (error) {
        console.log(`Error ${label}.new():`, error);
        return {};
      }
    },

    findOne: async (query) => {
      try {
        if (!allowed()) return;
        if (useMongo()) return await model.findOne({ id: query.id });
        if (usePg()) return await pg.findOne(collection, query);
        return await dbs.findOne(collection, { id: query.id });
      } catch (error) {
        console.log(`Error ${label}.findOne():`, error);
      }
    },

    find: async (query) => {
      try {
        if (!allowed()) return;
        if (useMongo()) return await model.find(query);
        return usePg() ? await pg.find(collection, query) : await dbs.find(collection, query);
      } catch (error) {
        console.log(`Error ${label}.find():`, error);
        return [];
      }
    },

    updateOne: async (filter, update = {}) => {
      try {
        if (!allowed()) return;
        if (!filter.id) return {};
        if (useMongo()) return await model.updateOne({ id: filter.id }, { ...update });
        if (usePg()) return await pg.updateOne(collection, { id: filter.id }, update);
        return await dbs.updateOne(collection, filter, update);
      } catch (error) {
        console.log(`Error ${label}.updateOne():`, error);
        return {};
      }
    },

    findOneAndDelete: async (filter) => {
      try {
        if (!allowed()) return;
        if (!filter.id) return [];
        if (useMongo()) return await model.findOneAndDelete({ id: filter.id });
        if (usePg()) return await pg.findOneAndDelete(collection, filter);
        return await dbs.findOneAndDelete(collection, filter);
      } catch (error) {
        console.log(`Error ${label}.findOneAndDelete():`, error);
        return null;
      }
    },
  };

  store.delete = store.findOneAndDelete;
  store.collection = {
    drop: async () => {
      try {
        if (!allowed()) return;
        if (useMongo()) return await model.collection.drop();
        return usePg() ? await pg.collection.drop(collection) : await dbs.collection.drop(collection);
      } catch (error) {
        console.log(`Error ${label}.collection.drop():`, error);
        return null;
      }
    },
  };

  return store;
}



const groupdb = _createStore({ model: sck, collection: 'sck', pg, dbs, label: 'groupdb' });
const userdb = _createStore({ model: sck1, collection: 'sck1', pg, dbs, label: 'userdb' });
const alivedb = _createStore({ model: alive, collection: 'bot_', pg, dbs, label: 'alivedb' });
const tempdb = _createStore({ model: dbtemp, collection: 'tempdb', pg, dbs, label: 'tempdb' });

module.exports = {
  tempdb,
  pg,
  dbs,
  groupdb,
  userdb,
  alivedb,
  bot_: alivedb,
};
