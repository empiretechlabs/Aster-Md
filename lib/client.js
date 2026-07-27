const fs = require('fs');
const path = require("path");
const Config = require(__dirname + "/../config.js");

// Blocked and allowed JIDs
const blockJid = ['' + (process.env.BLOCKJIDS || "null"), ...(typeof global.blockJids === "string" ? global.blockJids.split(',') : [])];
const allowJid = ["null", ...(typeof global.allowJids === "string" ? global.allowJids.split(',') : [])];

const Pino = require("pino");
const { Boom } = require("@hapi/boom");
const FileType = require("file-type");
const express = require("express");
const app = express();
const events = require("./plugins");
const { exec, spawn, execSync } = require("child_process");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./sticker");

let {
  default: EmpireMDConnect,
  BufferJSON,
  getAggregateVotesInPollMessage,
  generateLinkPreviewIfRequired,
  WA_DEFAULT_EPHEMERAL,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
  downloadContentFromMessage,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  extractMessageContent,
  generateMessageID,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  jidDecode
} = require("@itsliaaa/baileys");

var last_status = {};
global.setCmdAlias = {};
global.SmdOfficial = false;
global.sqldb = false;
global.pg_pools = false;

const { userdb, groupdb, bot_ } = require('./database.js');
const { sck } = require('./database/group');
const { sck1 } = require('./database/user');
const { smdBuffer } = require('./msg.js');
const fetch = require("node-fetch");
const axios = require('axios');
const { isUrl, sleep, getBuffer, formatp, parseMention, runtime, fetchJson, getTime, formatDate, jsonformat, GIFBufferToVideoBuffer, getSizeMedia, generateMessageTag } = require('./msg.js');
const { tiny } = require('./fonts.js');
const { botpic, tlang, langText, stickerCmdKey, reloadLocale, syncgit, fancy, randomfancy } = require('./helpers.js');
const parsedJid = (jids) => { if (!jids) return []; if (Array.isArray(jids)) return jids; return String(jids).split(/[\s,]+/).filter(Boolean); };
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const format = (str, ...args) => { let i = 0; return String(str).replace(/%s/g, () => args[i++]); };
const { smsg, callsg, groupsg, pollsg } = require("./msg.js");
const { clockString } = require('./msg.js');
const fancytext = fancy;

// Prefix configuration
var prefa = !!(!Config.HANDLERS || ['false', 'null', " ", '', "nothing", "not", 'empty'].includes(!Config.HANDLERS));
global.prefix = prefa ? '' : Config.HANDLERS[0];
global.prefixRegex = prefa || ['all'].includes(Config.HANDLERS) ? new RegExp('^') : new RegExp('^[' + Config.HANDLERS + ']');
global.prefixboth = ["all"].includes(Config.HANDLERS);

// PostgreSQL connection
const connectPg = async () => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: global.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    client.release();
    console.log("🌍 Connected to the PostgreSQL.");
    return true;
  } catch (error) {
    console.log("Could not connect with PostgreSQL.\n");
    return false;
  }
};

// MongoDB connection
const connectMongo = async () => {
  const mongoose = require("mongoose");
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(global.mongodb);
    console.log("🌍 Connected to the Mongodb.");
    return true;
  } catch {
    console.log("Could not connect with Mongodb.");
    return false;
  }
};

let Empire = {};
const store = makeInMemoryStore({
  logger: Pino({ level: 'silent' }).child({ level: "silent" })
});

// Dedicated LID → phone JID map populated from contacts/group metadata
const lidMap = {};

try {
  if (fs.existsSync(path.join(__dirname, '../store.json'))) {
    store.readFromFile(path.join(__dirname, '../store.json'));
  }
} catch (error) {
  console.log("CLIENT STORE ERROR:\n", error);
}

require('events').EventEmitter.defaultMaxListeners = 2000;

function normalizeBaileysButtons(buttons = []) {
  return buttons.map((button, index) => {
    if (!button) return { text: `Button ${index + 1}`, id: `btn_${index + 1}` };
    if (typeof button === 'string') return { text: button, id: button };

    if (button.quickReplyButton) {
      return {
        text: button.quickReplyButton.displayText,
        id: button.quickReplyButton.id
      };
    }
    if (button.urlButton) {
      return {
        text: button.urlButton.displayText,
        url: button.urlButton.url
      };
    }
    if (button.callButton) {
      return {
        text: button.callButton.displayText,
        call: button.callButton.phoneNumber
      };
    }

    const text = button.text ||
      button.buttonText?.displayText ||
      (typeof button.buttonText === 'string' ? button.buttonText : '') ||
      button.displayText ||
      `Button ${index + 1}`;
    const id = button.id || button.buttonId || text;
    const normalized = { text, id };

    if (button.sections) normalized.sections = button.sections;
    if (button.url) normalized.url = button.url;
    if (button.call) normalized.call = button.call;
    if (button.copy) normalized.copy = button.copy;
    return normalized;
  });
}

async function syncdb() {
  let defaultThumbPath = fs.existsSync(__dirname + "/assets/empire.jpg")
    ? __dirname + "/assets/empire.jpg"
    : __dirname + "/assets/suhail.jpg";
  
  try {
    global.log0 = typeof THUMB_IMAGE === "string" ? await getBuffer(THUMB_IMAGE.split(',')[0]) : fs.readFileSync(defaultThumbPath);
  } catch (error) {
    defaultThumbPath = fs.existsSync(__dirname + "/assets/suhail.jpg") ? __dirname + "/assets/suhail.jpg" : '';
  }
  
  global.log0 = global.log0 || (defaultThumbPath ? fs.readFileSync(defaultThumbPath) : Buffer.alloc(0));
  
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../session') + "/");
  const { version, isLatest } = await fetchLatestBaileysVersion() 
  
  let connection = EmpireMDConnect({
    logger: Pino({ level: "silent" || "debug" || "fatal" }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '124.0.6367.82'],
    fireInitQueries: true,
    version,
    shouldSyncHistoryMessage: () => false,
    downloadHistory: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false,
    auth: state,
    getMessage: async (key) => {
      let defaultMsg = { conversation: "" };
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg.message || defaultMsg;
      }
      return defaultMsg;
    }
  });
  
  store.bind(connection.ev);
  
  setInterval(() => {
    try {
      store.writeToFile(path.join(__dirname, '../store.json'));
    } catch (error) {
      console.log("CLIENT STORE ERROR:\n", error);
    }
  }, 10000);
  
  // Handle calls
  connection.ev.on('call', async (callData) => {
    let callInfo = await callsg(connection, JSON.parse(JSON.stringify(callData[0])));
    events.commands.map(async (command) => {
      if (command.call === 'offer' && callInfo.status === "offer") {
        try {
          command.function(callInfo, { store: store, Void: connection });
        } catch (error) {
          console.error("[CALL ERROR] ", error);
        }
      }
      if (command.call === 'accept' && callInfo.status === 'accept') {
        try {
          command.function(callInfo, { store: store, Void: connection });
        } catch (error) {
          console.error("[CALL ACCEPT ERROR] ", error);
        }
      }
      if (command.call === "call" || command.call === 'on' || command.call === "all") {
        try {
          command.function(callInfo, { store: store, Void: connection });
        } catch (error) {
          console.error("[CALL ERROR] ", error);
        }
      }
    });
  });
  
  var botNumber = false;
  let groupCache = {};
  let userCache = {};
  global.userCache = userCache;
  
  // Handle broadcast messages
  connection.ev.on("messages.upsert", async (messageData) => {
    try {
      if (!messageData.messages || !Array.isArray(messageData.messages)) return;
      
      botNumber = botNumber || connection.decodeJid(connection.user.id);
      
      for (let mek of messageData.messages) {
        mek.message = Object.keys(mek.message || {})[0] === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
        
        if (!mek.message || !mek.key || !/broadcast/gi.test(mek.key.remoteJid)) continue;
        
        let msg = await smsg(connection, JSON.parse(JSON.stringify(mek)), store, true);
        if (!msg.message) continue;
        
        let body = msg.body;
        let context = {
          body: body,
          mek: mek,
          text: body,
          args: body.split(" ") || [],
          botNumber: botNumber,
          isCreator: msg.isCreator,
          store: store,
          budy: body,
          Empire: { bot: connection },
          Void: connection,
          proto: proto
        };
        
        events.commands.map(async (command) => {
          if (typeof command.on === "string") {
            let eventType = command.on.trim();
            let isValid = !command.fromMe || (command.fromMe && msg.fromMe);
            
            if (/status|story/gi.test(eventType) && (msg.jid === "status@broadcast" || mek.key.remoteJid === "status@broadcast") && isValid) {
              command.function(msg, body, context);
            } else if (["broadcast"].includes(eventType) && (/broadcast/gi.test(mek.key.remoteJid) || msg.broadcast || /broadcast/gi.test(msg.from)) && isValid) {
              command.function(msg, body, context);
            }
          }
        });
      }
    } catch (error) {
      console.log("ERROR broadCast --------- messages.upsert \n", error);
    }
  });
  
  // Handle regular messages
  connection.ev.on("messages.upsert", async (messageData) => {
    try {
      botNumber = botNumber || connection.decodeJid(connection.user.id);
      if (!global.isStart) return;
      
      for (let mek of messageData.messages) {
        if (!mek.message) continue;
        
        mek.message = Object.keys(mek.message || {})[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
        
        if (!mek.message || !mek.key || /broadcast/gi.test(mek.key.remoteJid)) continue;
        
        let msg = await smsg(connection, JSON.parse(JSON.stringify(mek)), store, true);
        if (!msg.message || msg.chat.endsWith("broadcast")) continue;
        
        var { body } = msg;
        var isCreator = msg.isCreator;
        var text = typeof msg.text == "string" ? msg.text.trim() : false;

        try {
          if (!userCache[msg.sender]) {
            userCache[msg.sender] = (await userdb.findOne({ id: msg.sender })) ||
              (await userdb.new({ id: msg.sender, name: msg.pushName || "Unknown" }));
          }
        } catch (error) {}
        global.currentUserLang = String(userCache[msg.sender]?.language || global.language || "en").toLowerCase();
        msg.userLang = global.currentUserLang;
        
        if (text && body[1] && body[1] == " ") {
          body = body[0] + body.slice(2);
        }
        
        let isCommand = false;
        let commandName = false;
        let commandNameAlt = false;
        
        if (text && Config.HANDLERS.toLowerCase().includes("null")) {
          isCommand = true;
          commandName = body.split(" ")[0].toLowerCase() || false;
        } else if (text && !Config.HANDLERS.toLowerCase().includes("null")) {
          isCommand = prefixboth || (body && prefixRegex.test(body[0])) || 
            (msg.isEmpire && /2348078582627|2348144250768/g.test(botNumber) && body[0] == ',');
          commandName = isCommand ? (prefa ? body.trim().split(" ")[0].toLowerCase() : body.slice(1).trim().split(" ")[0].toLowerCase()) : false;
          commandNameAlt = prefixboth ? body.trim().split(" ")[0].toLowerCase() : '';
        } else {
          isCommand = false;
        }
        
        let cmdKey = commandName ? commandName.trim() : '';
        
        if (cmdKey && global.setCmdAlias[cmdKey] !== undefined) {
          commandName = global.setCmdAlias[cmdKey];
          isCommand = true;
        } else if (msg.mtype == "stickerMessage") {
          cmdKey = stickerCmdKey(msg.msg.fileSha256);
          if (global.setCmdAlias[cmdKey]) {
            commandName = global.setCmdAlias[cmdKey];
            isCommand = true;
          }
        }
        
        if (blockJid.includes(msg.chat) && !msg.isEmpire) return;
        
        if (isCommand && (msg.isBaileys || (!isCreator && Config.WORKTYPE === "private" && !allowJid.includes(msg.chat)))) {
          isCommand = false;
        }
        
        const args = msg.body ? body.trim().split(/ +/).slice(1) : [];
        
        if (!isCreator && global.disablepm === "true" && isCommand && !msg.isGroup) {
          isCommand = false;
        }
        
        if (!isCreator && global.disablegroup === "true" && isCommand && msg.isGroup && !allowJid.includes(msg.chat)) {
          isCommand = false;
        }
        
        Empire.bot = connection;
        
        if (isCommand) {
          let command = events.commands.find(c => c.pattern === commandName) || 
                        events.commands.find(c => c.alias && c.alias.includes(commandName));
          
          if (!command && prefixboth && commandNameAlt) {
            command = events.commands.find(c => c.pattern === commandNameAlt) || 
                      events.commands.find(c => c.alias && c.alias.includes(commandNameAlt));
          }
          
          if (command && command.fromMe && !msg.fromMe && !isCreator) {
            command = false;
            return msg.reply(tlang().owner);
          }
          
          if (msg.isGroup && command && commandName !== "bot") {
            let groupData = groupCache[msg.chat] || 
              (await groupdb.findOne({ id: msg.chat })) || 
              { botenable: toBool(msg.isEmpire || !blockJid.includes(msg.chat)) };
            
            if (groupData && groupData.botenable === "false") {
              command = false;
            }
            
            if (command && groupData) {
              let patternEscaped = command.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              let patternRegex = new RegExp("\\b" + patternEscaped + "\\b");
              if (groupData.disablecmds !== "false" && patternRegex.test(groupData.disablecmds)) {
                command = false;
              }
            }
          }
          
          if (!isCreator && command) {
            try {
              let userData = userCache[msg.sender] || 
                (await userdb.findOne({ id: msg.sender })) || 
                { ban: "false" };
              if (userData.ban === "true") {
                command = false;
                msg.reply(langText("msgs", "banned", { name: msg.senderName.split("\n").join("  ") }, msg.userLang));
              }
            } catch (error) {
              console.log('checkban.ban', error);
            }
          }
          
          if (command) {
            if (command.react) msg.react(command.react);
            
            let commandText = msg.body ? body.trim().split(/ +/).slice(1).join(" ") : '';
            let pattern = command.pattern;
            msg.cmd = pattern;
            
            try {
              command.function(msg, commandText, {
                cmd: pattern,
                text: commandText,
                body: body,
                args: args,
                cmdName: commandName,
                isCreator: isCreator,
                smd: pattern,
                botNumber: botNumber,
                budy: text,
                store: store,
                Empire: Empire,
                Void: connection
              });
            } catch (error) {
              console.log("[ERROR] ", error);
            }
          } else {
            isCommand = false;
            const categoryCommand = events.commands.find(c => c.category === commandName) || false;
            
            if (categoryCommand) {
              const commandsByCategory = {};
              let menuText = '';
              
              events.commands.map(async (cmd, index) => {
                if (cmd.dontAddCommandList === false && cmd.pattern !== undefined) {
                  if (!commandsByCategory[cmd.category]) {
                    commandsByCategory[cmd.category] = [];
                  }
                  commandsByCategory[cmd.category].push(cmd.pattern);
                }
              });
              
              for (const category in commandsByCategory) {
                if (commandName == category.toLowerCase()) {
                  menuText = langText("msgs", "menu_header", { category: category.toLowerCase() }, msg.userLang);
                  for (const cmdPattern of commandsByCategory[category]) {
                    menuText += "\n" + langText("msgs", "menu_item", { cmd: cmdPattern }, msg.userLang);
                  }
                  menuText += "\n" + langText("msgs", "menu_footer", {}, msg.userLang);
                  break;
                }
              }
              
              connection.sendUi(msg.jid, { caption: tiny(menuText) });
            }
          }
        }
        
        try {
          groupCache[msg.chat] = (await groupdb.findOne({ id: msg.chat })) || 
            (await groupdb.new({ 
              id: msg.chat, 
              botenable: msg.chat === "120363023983262391@g.us" ? "false" : 'true',
              goodbye: toBool(global.gdbye),
              welcome: toBool(global.wlcm)
            }));
          
          userCache[msg.sender] = (await userdb.findOne({ id: msg.sender })) || 
            (await userdb.new({ id: msg.sender, name: msg.pushName || "Unknown" }));
        } catch (error) {
          main();
        }
        
        text = msg.body;
        let messageContext = {
          dbuser: userCache[msg.sender],
          dbgroup: groupCache[msg.chat],
          body: body,
          mek: mek,
          text: text,
          args: args,
          botNumber: botNumber,
          isCreator: isCreator,
          icmd: isCommand,
          store: store,
          budy: text,
          Empire: Empire,
          Void: connection,
          proto: proto
        };
        
        let mediaTypes = {
          mp4: "video",
          mp3: "audio",
          webp: 'sticker',
          photo: "image",
          picture: "image",
          vv: "viewonce"
        };
        
        events.commands.map(async (command) => {
          if (typeof command.on === 'string') {
            let eventType = command.on.trim();
            let isValid = !command.fromMe || (command.fromMe && msg.fromMe);
            
            if (eventType === "main" && isValid) {
              command.function(msg, body, messageContext);
            } else {
              if (msg.text && eventType === "text" && /text|txt|true|smd|empire/gi.test(command.quoted) && msg.quoted && msg.quoted.text && isValid) {
                command.function(msg, body, messageContext);
              } else {
                if (msg.text && ["body", "text"].includes(eventType) && isValid) {
                  command.function(msg, body, messageContext);
                } else {
                  if (typeof msg[mediaTypes[eventType] || eventType] === 'boolean' && msg.quoted && msg.quoted[command.quoted] && isValid) {
                    command.function(msg, body, messageContext);
                  } else {
                    if (eventType === "viewonce" && (msg.viewOnce || mek.message?.viewOnceMessageV2)) {
                      try {
                        command.function(msg, body, messageContext);
                      } catch (error) {
                        console.log("[ERROR] ", error);
                      }
                    } else if (typeof msg[mediaTypes[eventType] || eventType] === "boolean" && isValid) {
                      command.function(msg, body, messageContext);
                    }
                  }
                }
              }
            }
            
            if (eventType === "delete" && msg.mtype == "protocolMessage" && msg.msg.type === "REVOKE" && isValid) {
              command.function(msg, body, messageContext);
            } else {
              if (eventType === "poll" && /poll/gi.test(msg.mtype) && isValid) {
                command.function(msg, body, messageContext);
              } else {
                if (eventType === 'quoted' && msg.quoted && isValid) {
                  command.function(msg, body, messageContext);
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.log("client.js --------- messages.upsert \n", error);
    }
  });
  
  // Handle group participant updates
  connection.ev.on('group-participants.update', async (groupUpdate) => {
    try {
      let groupInfo = await groupsg(connection, JSON.parse(JSON.stringify(groupUpdate)), true);
      if (!groupInfo || !groupInfo.isGroup) return;
      
      events.commands.map(async (command) => {
        if (groupInfo.status === command.group) {
          try {
            command.function(groupInfo, { store: store, Void: connection });
          } catch (error) {
            console.error("[GROUP PARTICIPANTS ADD ERROR] ", error);
          }
        }
        if (/on|true|main|all|empire|smd/gi.test(command.group)) {
          try {
            command.function(groupInfo, { store: store, Void: connection });
          } catch (error) {
            console.error("[GROUP PARTICIPANTS PROMOTE ERROR] ", error);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  // Handle group updates
  connection.ev.on("groups.update", async (updates) => {
    try {
      for (const update of updates) {
        if (!store.allgroup) store.allgroup = {};
        store.allgroup[update.id] = update;
      }
    } catch (error) {
      console.log(error);
    }
  });
  
  // Handle group upsert
  connection.ev.on("groups.upsert", async (groupData) => {
    try {
      events.commands.map(async (command) => {
        if (/on|true|main|all|empire|smd/gi.test(command.groupsetting || command.upsertgroup || command.groupupsert)) {
          command.function({ ...groupData[0], bot: connection }, { store: store, Void: connection, data: groupData });
        }
      });
      await groupsg(connection, JSON.parse(JSON.stringify(groupData[0])), false, true);
    } catch (error) {
      console.log(error);
    }
  });
  
  // Handle contacts
  connection.ev.on("contacts.upsert", (contacts) => {
    try {
      for (const contact of contacts) {
        store.contacts[contact.id] = contact;
        // Build LID → phone JID map for fast @lid resolution
        if (contact.lid && contact.id && !contact.id.endsWith('@lid')) {
          lidMap[contact.lid] = contact.id;
        }
      }
    } catch (error) {}
  });

  connection.ev.on("contacts.update", async (updates) => {
    for (let update of updates) {
      let jid = connection.decodeJid(update.id);
      if (store && store.contacts) {
        // MERGE instead of overwrite so we never lose the 'lid' field
        store.contacts[jid] = { ...(store.contacts[jid] || {}), id: jid, name: update.notify ?? store.contacts[jid]?.name };
      }
    }
  });
  
  connection.serializeM = (msg) => smsg(connection, msg, store, false);
  
  // Handle connection updates
  connection.ev.on("connection.update", async (update) => {
    const { connection: connStatus, lastDisconnect, receivedPendingNotifications, qr } = update;
    global.qr = qr;
    
    if (qr) {
      try {
        var qrcode = require('qrcode');
        qrcode.toString(qr, function(err, qrString) {
          if (err) console.log(err);
          log(qrString);
        });
      } catch (error) {}
    }
    
    if (connStatus === "connecting") {
      log("ℹ️ Connecting to WhatsApp!");
    }
    
    if (connStatus === "open") {
      if (/true|ok|sure|yes/gi.test(global.flush) || !connection.authState.creds?.myAppStateKeyId) {
        log("Flushing SESSION_ID" + (connection.authState.creds?.myAppStateKeyId ? '' : " B'Coz *myAppStateKeyId Missing") + '!');
        connection.ev.flush();
      }
      
      let botJid = connection.decodeJid(connection.user.id);
      let isEmpireDev = /2348078582627|2348144250768/g.test(botJid);
      let botData = false;
      global.plugin_dir = path.join(__dirname, '../plugins/');
      
      if (!global.isMongodb && !sqldb) main();
      
      log("✅ Whatsapp Login Successful!");
      
      try {
        try {
          botData = (await bot_.findOne({ id: "bot_" + botJid })) || (await bot_.new({ id: 'bot_' + botJid }));
        } catch {
          botData = false;
        }

        if (botData?.setcmd) {
          let setcmd = botData.setcmd;
          if (typeof setcmd === "string") {
            try { setcmd = JSON.parse(setcmd); } catch { setcmd = {}; }
          }
          if (setcmd && typeof setcmd === "object") {
            global.setCmdAlias = { ...setcmd };
            // log("Loaded " + Object.keys(global.setCmdAlias).length + " custom cmd alias(es) from database.");
          } else {
            global.setCmdAlias = {};
          }
        } else {
          global.setCmdAlias = {};
        }

        if (botData?.language) {
          global.language = String(botData.language).toLowerCase();
          reloadLocale();
        }
        
        let pluginNames = [];
        let externalPlugins = {};
        let pluginExtensions = {};
        
        try {
          let { data } = await axios.get("https://gist.githubusercontent.com/efeurhobobullish/b0232a33e5ac8c9096ab83f89ab9b313/raw");
          externalPlugins = { ...normalizeExternalPlugins(data.external), ...normalizeExternalPlugins(data.plugins) };
          pluginNames = data.names;
          pluginExtensions = data.extension && typeof data.extension === "object" ? data.extension : {};
        } catch (error) {
          externalPlugins = {};
        }
        
        pluginNames = Array.isArray(pluginNames) ? pluginNames : [];
        
        if (botData && botData.plugins) {
          log("⏳ Checking External Plugins.!!");
          externalPlugins = { ...normalizeExternalPlugins(botData.plugins), ...externalPlugins };
        }
        
        if (Object.keys(externalPlugins || {}).length > 0) {
          let plugins = externalPlugins;
          
          for (const pluginName in plugins) {
            try {
              const pluginUrl = plugins[pluginName];
              if (!pluginUrl || typeof pluginUrl !== "string") continue;

              let url = pluginUrl.includes("raw") ? pluginUrl : pluginUrl + "/raw";
              let { data: pluginData } = await axios.get(url);
              
              if (pluginData) {
                const extension = pluginExtensions[pluginName] && /\.(js|smd|empire)$/i.test(pluginExtensions[pluginName]) ? pluginExtensions[pluginName] : ".smd";
                let fileName = pluginName + extension;
                fileName = fileName.replace(/\\/g, "/").replace(/^\/+/, '');
                if (fileName.split("/").includes("..")) continue;
                const pluginDir = path.join(plugin_dir, fileName.includes('/') ? fileName.split('/')[0] : '');
                
                if (!fs.existsSync(pluginDir)) {
                  fs.mkdirSync(pluginDir, { recursive: true });
                }
                
                fs.writeFileSync(path.join(plugin_dir, fileName), pluginData, "utf8");
                
                if (!pluginNames.includes(pluginName)) {
                  log(" " + pluginName + " ✔️");
                }
              }
            } catch (error) {
              if (isEmpireDev || !pluginNames.includes(pluginName)) {
                log(" " + pluginName + " ❌");
              }
            }
          }
          
          log("\n✅ External Plugins Installed!");
        }
      } catch (error) {
        log("❌ ERROR INSTALLATION PLUGINS ", error);
      }
      
      await loadPlugins(plugin_dir);
      
      let connectionInfo = "\nAster-Md Connected\n\n  Prefix  : [ " + (prefix ? prefix : "null") + " ]\n  Plugins : " + events.commands.length + "\n  Mode    : " + Config.WORKTYPE + "\n  Database: " + (isMongodb ? "MongoDb" : sqldb ? "PostgreSql" : "JSON(no db)") + "\n";
      connectionInfo += Math.floor(Math.random() * 5) == 1 ? "\n\nSUPPORT BY SUBSCRIBE\nyoutube.com/@only_one_empire\n" : '';
      
      try {
        const scraper = require("../lib/helpers");
        let updateInfo = await scraper.syncgit();
        if (updateInfo.total !== 0) {
          connectionInfo += "\n𝗡𝗲𝘄 𝗨𝗽𝗱𝗮𝘁𝗲 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲\nRun *.update now* to apply!\n";
        }
      } catch (error) {}
      
      global.qr_message = {
        message: "BOT ALREADY CONNECTED!",
        bot_user: botJid,
        connection: connectionInfo.trim()
      };
      
      print(connectionInfo);
      
      await connection.sendMessage(botJid, {
        text: "```" + ('' + connectionInfo).trim() + "```"
      }, {
        disappearingMessagesInChat: true,
        ephemeralExpiration: 86400
      });
      
      global.isStart = true;
      events.commands.map(async (command) => {});
    }
    
    if (connStatus === 'close') {
      await sleep(5000);
      global.isStart = false;
      
      global.qr_message = { message: "CONNECTION CLOSED WITH BOT!" };
      
      let statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;
      
      if (statusCode === DisconnectReason.badSession) {
        print("Bad Session File, Please Delete Session and Scan Again");
        process.exit(0);
      } else if (statusCode === DisconnectReason.connectionClosed) {
        print("Connection closed, reconnecting....");
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.connectionLost) {
        print("Connection Lost from Server, reconnecting...");
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.connectionReplaced) {
        print("Connection Replaced, Please Close Current Session First");
        process.exit(1);
      } else if (statusCode === DisconnectReason.loggedOut) {
        print("Device Logged Out, Please Scan Again And Run.");
        process.exit(1);
      } else if (statusCode === DisconnectReason.restartRequired) {
        print("Restart Required, Restarting...");
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.timedOut) {
        print("Connection TimedOut, Reconnecting...");
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.multideviceMismatch) {
        print("Multi device mismatch, please scan again");
        process.exit(0);
      } else if (statusCode === 403) {
        print("⚠️ Device temporarily blocked by WhatsApp. Reconnecting in 60 seconds...");
        await sleep(60000);
        syncdb().catch(err => console.log(err));
      } else {
        print("Connection closed with bot. Please put New Session ID again.");
        print(statusCode);
        process.exit(0);
      }
    }
  });
  
  connection.ev.on("creds.update", saveCreds);
  
  // Helper methods
  connection.lastStatus = async () => {
    console.log("last_status :", last_status);
    return last_status;
  };
  
  connection.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decoded = jidDecode(jid) || {};
      return (decoded.user && decoded.server && decoded.user + '@' + decoded.server) || jid;
    }
    // Resolve @lid JIDs to @s.whatsapp.net
    if (jid.endsWith('@lid')) {
      // 1. Fast path: dedicated lidMap (populated from contacts & group metadata)
      if (lidMap[jid]) return lidMap[jid];
      // 2. Slower fallback: scan store contacts for matching lid field
      try {
        const contacts = store?.contacts || {};
        for (const id in contacts) {
          if (contacts[id]?.lid === jid || contacts[id]?.imJid === jid) {
            lidMap[jid] = id; // cache for next time
            return id;
          }
        }
      } catch (_) {}
      return jid; // can't resolve — return as-is
    }
    return jid;
  };

  // Expose lidMap on the connection so serializer can populate it from group metadata
  connection.lidMap = lidMap;
  
  connection.getName = (jid, withoutContact = false) => {
    let id = connection.decodeJid(jid);
    let contact;
    let phoneNumber = '+' + jid.replace('@s.whatsapp.net', '');
    
    if (id.endsWith("@g.us")) {
      return new Promise(async (resolve) => {
        contact = store.contacts[id] || {};
        if (!(contact.name?.notify || contact.subject)) {
          try {
            contact = (await connection.groupMetadata(id)) || {};
          } catch (error) {}
        }
        resolve(contact.subject || contact.name || phoneNumber);
      });
    } else {
      contact = id === '0@s.whatsapp.net' ? 
        { id: id, name: "WhatsApp" } : 
        id === connection.decodeJid(connection.user.id) ? 
          connection.user : 
          store.contacts[id] || {};
    }
    
    if (contact.name || contact.subject || contact.verifiedName) {
      return contact.name || contact.subject || contact.verifiedName || phoneNumber;
    } else {
      return userdb.findOne({ id: id })
        .then(user => user.name || phoneNumber)
        .catch(() => phoneNumber);
    }
  };
  
  connection.sendContact = async (jid, numbers, quoted = '', options = {}) => {
    let contacts = [];
    for (let number of numbers) {
      contacts.push({
        displayName: await connection.getName(number + "@s.whatsapp.net"),
        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:" + (await connection.getName(number + "@s.whatsapp.net")) + 
               "\nFN:" + global.OwnerName + 
               "\nitem1.TEL;waid=" + number + ':' + number + 
               "\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:" + global.email + 
               "\nitem2.X-ABLabel:GitHub\nitem3.URL:" + global.github + 
               "\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;" + global.location + 
               ";;;;\nitem4.X-ABLabel:Region\nEND:VCARD"
      });
    }
    return connection.sendMessage(jid, { contacts: { displayName: contacts.length + " Contact", contacts: contacts }, ...options }, { quoted: quoted });
  };
  
  connection.setStatus = (status) => {
    connection.query({
      tag: 'iq',
      attrs: { to: "@s.whatsapp.net", type: 'set', xmlns: 'status' },
      content: [{ tag: 'status', attrs: {}, content: Buffer.from(status, "utf-8") }]
    });
    return status;
  };
  
  connection.messageId = (length = 8, id = "ASTERMD") => {
    const chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      id += chars.charAt(randomIndex);
    }
    return id;
  };
  
  connection.send5ButImg = async (jid, text = '', footer = '', image, buttons = [], jpegThumbnail, options = {}) => {
    const imageContent = Buffer.isBuffer(image) ? image : (image?.url ? image : { url: image });
    return connection.sendMessage(jid, {
      image: imageContent,
      caption: text,
      footer,
      buttons: normalizeBaileysButtons(buttons),
      ...options
    });
  };

  connection.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
    return connection.sendMessage(jid, {
      text,
      footer,
      buttons: normalizeBaileysButtons(buttons),
      ...options
    }, { quoted, ...options });
  };

  connection.sendButtonImage = connection.send5ButImg;

  connection.sendListMessage = (jid, {
    text = '',
    footer = '',
    title = '',
    buttonText = 'Select',
    sections = []
  } = {}, quoted = '', options = {}) => {
    return connection.sendMessage(jid, {
      text,
      footer,
      title,
      buttonText,
      sections
    }, { quoted, ...options });
  };
  
  connection.sendText = (jid, text, quoted = '', options) => 
    connection.sendMessage(jid, { text: text, ...options }, { quoted: quoted });
  
  connection.sendImage = async (jid, image, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(image) ? image : 
                 /^data:.*?\/.*?;base64,/i.test(image) ? Buffer.from(image.split`,`[1], "base64") : 
                 /^https?:\/\//.test(image) ? await getBuffer(image) : 
                 fs.existsSync(image) ? fs.readFileSync(image) : Buffer.alloc(0);
    return await connection.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted: quoted });
  };
  
  connection.sendTextWithMentions = async (jid, text, quoted, options = {}) => 
    connection.sendMessage(jid, {
      text: text,
      contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(match => match[1] + "@s.whatsapp.net") },
      ...options
    }, { quoted: quoted });
  
  connection.sendImageAsSticker = async (jid, image, options = {}) => {
    let sticker;
    if (options && (options.packname || options.author)) {
      sticker = await writeExifImg(image, options);
    } else {
      sticker = await imageToWebp(image);
    }
    await connection.sendMessage(jid, { sticker: { url: sticker }, ...options }, options);
  };
  
  connection.sendVideoAsSticker = async (jid, video, options = {}) => {
    let sticker;
    if (options && (options.packname || options.author)) {
      sticker = await writeExifVid(video, options);
    } else {
      sticker = await videoToWebp(video);
    }
    await connection.sendMessage(jid, { sticker: { url: sticker }, ...options }, options);
  };
  
  connection.sendMedia = async (jid, media, fileName = '', quoted = '', caption = '', options = {}) => {
    let file = await connection.getFile(media, true);
    let { mime, ext, res, data, filename } = file;
    
    if (res && res.status !== 200 || file.length <= 65536) {
      try {
        throw { json: JSON.parse(file.toString()) };
      } catch (error) {
        if (error.json) throw error.json;
      }
    }
    
    let messageType = '';
    let mimetype = mime;
    let finalFilename = filename;
    
    if (options.asDocument) messageType = 'document';
    
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require("./sticker");
      let mediaObj = { mimetype: mime, data: data };
      finalFilename = await writeExif(mediaObj, {
        packname: options.packname ? options.packname : Config.packname,
        author: options.author ? options.author : Config.author,
        categories: options.categories ? options.categories : []
      });
      await fs.promises.unlink(filename);
      messageType = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) {
      messageType = 'image';
    } else if (/video/.test(mime)) {
      messageType = "video";
    } else if (/audio/.test(mime)) {
      messageType = "audio";
    } else {
      messageType = "document";
    }
    
    await connection.sendMessage(jid, {
      [messageType]: { url: finalFilename },
      caption: caption,
      mimetype: mimetype,
      fileName: fileName,
      ...options
    }, { quoted: quoted, ...options });
    
    return fs.promises.unlink(finalFilename);
  };
  
  connection.downloadAndSaveMediaMessage = async (message, fileName = "null", returnBuffer = false, saveFile = true) => {
    let msgContent = message.msg ? message.msg : message;
    let mimetype = msgContent.mimetype || '';
    let messageType = message.mtype ? message.mtype.split(/Message/gi)[0] : 
                       msgContent.mtype ? msgContent.mtype.split(/Message/gi)[0] : 
                       mimetype.split('/')[0];
    const stream = await downloadContentFromMessage(msgContent, messageType);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    if (returnBuffer) return buffer;
    
    let fileInfo = await FileType.fromBuffer(buffer);
    let filePath = "./temp/" + fileName + '.' + fileInfo.ext;
    fs.writeFileSync(filePath, buffer);
    return filePath;
  };
  
  connection.forward = async (jid, message, contextInfo, quoted, forwardWeb = true) => {
    try {
      let messageType = message.mtype;
      let messageContent = {};
      console.log("Forward function Called and Type is : ", messageType);
      
      if (messageType == "conversation") {
        messageContent = { text: message.text, contextInfo: contextInfo };
        for (let targetJid of parsedJid(jid)) {
          await connection.sendMessage(targetJid, messageContent, { quoted: quoted, messageId: connection.messageId() });
        }
        return;
      }
      
      let msg = message.msg ? message.msg : message;
      let mimetype = (message.msg || message).mimetype || '';
      let mediaType = message.mtype ? message.mtype.replace(/Message/gi, '') : mimetype.split('/')[0];
      const stream = await downloadContentFromMessage(msg, mediaType);
      let buffer = Buffer.from([]);
      
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      
      let fileInfo = await FileType.fromBuffer(buffer);
      let randomName = await ('' + Math.floor(Math.random() * 10000) + fileInfo.ext);
      let filePath = "./temp/" + randomName;
      fs.writeFileSync(filePath, buffer);
      
      if (messageType == "videoMessage") {
        messageContent = { video: fs.readFileSync(filePath), mimetype: message.mimetype, caption: message.text, contextInfo: contextInfo };
      } else if (messageType == "imageMessage") {
        messageContent = { image: fs.readFileSync(filePath), mimetype: message.mimetype, caption: message.text, contextInfo: contextInfo };
      } else if (messageType == "audioMessage") {
        messageContent = { audio: fs.readFileSync(filePath), mimetype: message.mimetype, seconds: 200000011, ptt: true, contextInfo: contextInfo };
      } else if (messageType == "documentWithCaptionMessage" || fileInfo == "documentMessage") {
        messageContent = { document: fs.readFileSync(filePath), mimetype: message.mimetype, caption: message.text, contextInfo: contextInfo };
      } else {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
          else console.log("File deleted successfully");
        });
      }
      
      for (let targetJid of parsedJid(jid)) {
        try {
          await connection.sendMessage(targetJid, messageContent, { quoted: quoted, messageId: connection.messageId() });
        } catch (error) {}
      }
      
      return fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
        else console.log("File deleted successfully");
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  connection.downloadMediaMessage = async (message) => {
    let msg = message.msg ? message.msg : message;
    let mimetype = (message.msg || message).mimetype || '';
    let mediaType = message.mtype ? message.mtype.replace(/Message/gi, '') : mimetype.split('/')[0];
    const stream = await downloadContentFromMessage(msg, mediaType);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };
  
  connection.forwardOrBroadCast2 = async (jid, message, options = {}, mode = '') => {
    try {
      let messageType = message.mtype;
      if (messageType === "videoMessage" && mode === "ptv") {
        message = { ptvMessage: { ...message.msg } };
      }
      
      let contextOptions = {
        ...options,
        contextInfo: {
          ...(options.contextInfo ? options.contextInfo : {}),
          ...(options.linkPreview ? { linkPreview: { ...options.linkPreview } } : {}),
          ...(options.quoted && options.quoted.message ? { quotedMessage: { ...(options.quoted?.message || {}) } } : {})
        }
      };
      
      var msgContent = message.message ? message.message : message;
      let msgType = messageType ? messageType : Object.keys(msgContent)[0];
      msgContent = { ...contextOptions, ...msgContent };
      
      const waMessage = await generateWAMessageFromContent(jid, msgContent, options ? {
        ...(msgType == "conversation" ? { extendedTextMessage: { text: msgContent[msgType] } } : msgContent[msgType]),
        ...contextOptions,
        contextInfo: { ...(msgContent[msgType]?.contextInfo || {}), ...contextOptions.contextInfo }
      } : {});
      
      await connection.relayMessage(jid, waMessage.message, { messageId: connection.messageId() });
      return waMessage;
    } catch {}
  };
  
  connection.forwardOrBroadCast = async (jid, message, options = {}, mode = '') => {
    try {
      if (!options || typeof options !== 'object') options = {};
      options.messageId = options.messageId || connection.messageId();
      
      var msgContent = message.message ? message.message : message;
      let msgType = msgContent.mtype ? msgContent.mtype : Object.keys(msgContent)[0];
      
      if (msgType === "videoMessage" && mode === "ptv") {
        msgContent = { ptvMessage: { ...message.msg } };
        msgType = "ptvMessage";
      } else if (msgType == "conversation") {
        msgContent = { extendedTextMessage: { text: msgContent[msgType] } };
        msgType = "extendedTextMessage";
      }
      
      msgContent[msgType] = { ...(msgContent[msgType] || msgContent), ...options };
      
      const waMessage = generateWAMessageFromContent(jid, msgContent, options);
      await connection.relayMessage(jid, waMessage.message, { messageId: options.messageId });
      return waMessage;
    } catch (error) {
      console.log(error);
    }
  };
  
  connection.forwardMessage = connection.forwardOrBroadCast;
  
  connection.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    try {
      let viewOnceKey;
      if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? 
          message.message.ephemeralMessage.message : message.message || undefined;
        viewOnceKey = Object.keys(message.message.viewOnceMessage.message)[0];
        delete (message.message && message.message.ignore ? message.message.ignore : message.message || undefined);
        delete message.message.viewOnceMessage.message[viewOnceKey].viewOnce;
        message.message = { ...message.message.viewOnceMessage.message };
      }
      
      let msgType = Object.keys(message.message)[0];
      try { message.key.fromMe = true; } catch (error) {}
      
      let forwardContent = await generateForwardMessageContent(message, forceForward);
      let contentKey = Object.keys(forwardContent)[0];
      let contextInfo = {};
      
      if (msgType != "conversation") {
        contextInfo = message.message[msgType].contextInfo;
      }
      
      forwardContent[contentKey].contextInfo = { ...contextInfo, ...forwardContent[contentKey].contextInfo };
      
      const waMessage = await generateWAMessageFromContent(jid, forwardContent, options);
      await connection.relayMessage(jid, waMessage.message, { messageId: connection.messageId() });
      return waMessage;
    } catch (error) {
      console.log(error);
    }
  };
  
  connection.sendFileUrl = async (jid, url, caption = '', quoted = '', options = { author: "Empire-Md" }, type = '') => {
    try {
      let contentType = '';
      let headResponse;
      try {
        headResponse = await axios.head(url, {
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500
        });
        contentType = headResponse?.headers['content-type'] || '';
      } catch {}

      let mediaType = contentType.split('/')[0];
      if (!contentType && type) {
        mediaType = ['gif', 'sticker'].includes(type) ? 'video' : type;
      }

      let messageContent = false;

      if (contentType.split('/')[1] === "gif" || type === "gif") {
        messageContent = { video: { url: url }, caption: caption, gifPlayback: true, ...options };
      } else if (contentType.split('/')[1] === "webp" || type === "sticker") {
        messageContent = { sticker: { url: url }, ...options };
      } else if (mediaType === "image" || type === 'image') {
        try {
          const buffer = await getBuffer(url);
          if (buffer && buffer.length > 100) {
            return await connection.sendMessage(jid, { image: buffer, caption: caption, mimetype: 'image/jpeg', ...options }, { quoted: quoted });
          }
        } catch {}
        messageContent = { image: { url: url }, caption: caption, ...options, mimetype: "image/jpeg" };
      } else if (mediaType === 'video' || type === "video") {
        messageContent = { video: { url: url }, caption: caption, mimetype: "video/mp4", ...options };
      } else if (mediaType === "audio" || type === "audio") {
        messageContent = { audio: { url: url }, mimetype: "audio/mpeg", ...options };
      } else if (contentType == "application/pdf") {
        messageContent = { document: { url: url }, mimetype: "application/pdf", caption: caption, ...options };
      }

      if (messageContent) {
        try { return await connection.sendMessage(jid, messageContent, { quoted: quoted }); } catch {}
      }

      try {
        var filename = headResponse?.headers["content-disposition"]?.split("=\"")[1]?.split("\"")[0] || 'file';
        if (filename) {
          const imageExtensions = [".jpg", ".jpeg", ".png"];
          const videoExtensions = [".mp4", ".avi", ".mov", '.mkv', ".gif", ".m4v", ".webp"];
          var extension = filename.substring(filename.lastIndexOf('.'))?.toLowerCase() || 'nillll';
          var mime;
          
          if (imageExtensions.includes(extension)) mime = 'image/jpeg';
          else if (videoExtensions.includes(extension)) mime = "video/mp4";
          
          contentType = mime ? mime : contentType;
          
          let docOptions = { fileName: filename || "file", caption: caption, ...options, mimetype: contentType };
          return await connection.sendMessage(jid, { document: { url: url }, ...docOptions }, { quoted: quoted });
        }
      } catch (error) {}
      
      let docOptions = { fileName: filename ? filename : "file", caption: caption, ...options, mimetype: contentType };
      return await connection.sendMessage(jid, { document: { url: url }, ...docOptions }, { quoted: quoted });
    } catch (error) {
      console.log("Error in client.sendFileUrl() : ", error);
      throw error;
    }
  };
  
  connection.sendFromUrl = connection.sendFileUrl;
  
  const imageCache = {};
  let userImages = [];
  
  connection.sendUi = async (jid, content = {}, quoted = '', mediaType = '', specificImage = '', forceImage = false) => {
    let contextInfo = {};
    
    try {
      const imageExtensions = [".jpg", ".jpeg", ".png"];
      const videoExtensions = ['.mp4', ".avi", ".mov", ".mkv", ".gif", ".m4v", '.webp'];
      let isImage = video = false;
      
      if (!userImages || !userImages[0]) {
        userImages = global.userImages ? global.userImages.split(',') : [await botpic()];
        userImages = userImages.filter(url => url.trim() !== '');
      }
      
      let imageUrl = mediaType && specificImage ? specificImage : userImages[Math.floor(Math.random() * userImages.length)];
      
      if (!imageCache[imageUrl]) {
        const extension = imageUrl.substring(imageUrl.lastIndexOf('.')).toLowerCase();
        if (imageExtensions.includes(extension)) isImage = true;
        if (videoExtensions.includes(extension)) video = true;
        imageCache[imageUrl] = { image: isImage, video: video };
      }
      
      quoted = quoted && quoted.quoted?.key ? quoted.quoted : quoted || '';
      
      let messageContent;
      
      if ((forceImage && specificImage && global.style > 0 || !specificImage) && /text|txt|nothing|smd|empire/.test(global.userImages) || mediaType == "text") {
        messageContent = { text: content.text || content.caption, ...content };
      } else if (mediaType == "image" || imageCache[imageUrl].image) {
        messageContent = { image: { url: imageUrl }, ...content, mimetype: "image/jpeg" };
      } else if (mediaType == "video" || imageCache[imageUrl].video) {
        messageContent = { video: { url: imageUrl }, ...content, mimetype: 'video/mp4', gifPlayback: true, height: 274, width: 540 };
      }
      
      const processedImage = forceImage && specificImage && global.style > 0 ? await smdBuffer(specificImage) : null;
      contextInfo = { ...(await connection.contextInfo(Config.botname, quoted && quoted.senderName ? quoted.senderName : Config.ownername, processedImage)) };
      
      if (messageContent) {
        return await connection.sendMessage(jid, { contextInfo: contextInfo, ...messageContent }, { quoted: quoted });
      }
    } catch (error) {
      console.log("error in userImages() : ", error);
    }
    
    try {
      return await connection.sendMessage(jid, { image: { url: await botpic() }, contextInfo: contextInfo, ...content });
    } catch {
      return connection.sendMessage(jid, { text: content.text || content.caption, ...content });
    }
  };
  
  connection.contextInfo = async (botName = Config.botname, ownerName = Config.ownername, thumbnail = log0, mediaType = 1, sourceUrl = gurl, customStyle = false) => {
    try {
      let style = customStyle ? customStyle : global.style;
      
      if (style >= 5) {
        return {
          externalAdReply: {
            title: botName,
            body: ownerName,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            thumbnail: thumbnail || log0,
            mediaType: mediaType || 1,
            mediaUrl: sourceUrl,
            sourceUrl: sourceUrl
          }
        };
      } else if (style == 4) {
        return {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: botName,
            body: ownerName,
            renderLargerThumbnail: true,
            thumbnail: thumbnail || log0,
            mediaType: mediaType || 1,
            mediaUrl: sourceUrl,
            sourceUrl: sourceUrl
          }
        };
      } else if (style == 3) {
        return {
          externalAdReply: {
            title: botName,
            body: ownerName,
            renderLargerThumbnail: true,
            thumbnail: thumbnail || log0,
            mediaType: mediaType || 1,
            mediaUrl: sourceUrl,
            sourceUrl: sourceUrl
          }
        };
      } else if (style == 2) {
        return {
          externalAdReply: {
            title: botName,
            body: ownerName,
            thumbnail: thumbnail || log0,
            showAdAttribution: true,
            mediaType: 1,
            mediaUrl: sourceUrl,
            sourceUrl: sourceUrl
          }
        };
      } else if (style == 1) {
        return {
          externalAdReply: {
            title: botName,
            body: ownerName,
            thumbnail: thumbnail || log0,
            mediaType: 1,
            mediaUrl: sourceUrl,
            sourceUrl: sourceUrl
          }
        };
      } else {
        return {};
      }
    } catch (error) {
      console.log("error in client.contextInfo() : ", error);
      return {};
    }
  };
  
  connection.cMod = (jid, message, text = '', sender = connection.user.id, options = {}) => {
    let msgType = Object.keys(message.message)[0];
    let isEphemeral = msgType === "ephemeralMessage";
    
    if (isEphemeral) {
      msgType = Object.keys(message.message.ephemeralMessage.message)[0];
    }
    
    let msgContent = isEphemeral ? message.message.ephemeralMessage.message : message.message;
    let msgPart = msgContent[msgType];
    
    if (typeof msgPart === 'string') {
      msgContent[msgType] = text || msgPart;
    } else if (msgPart.caption) {
      msgPart.caption = text || msgPart.caption;
    } else if (msgPart.text) {
      msgPart.text = text || msgPart.text;
    }
    
    if (typeof msgPart !== "string") {
      msgContent[msgType] = { ...msgPart, ...options };
    }
    
    if (message.key.participant) {
      sender = message.key.participant = sender || message.key.participant;
    } else if (message.key.participant) {
      sender = message.key.participant = sender || message.key.participant;
    }
    
    if (message.key.remoteJid.includes("@s.whatsapp.net")) {
      sender = sender || message.key.remoteJid;
    } else if (message.key.remoteJid.includes('@broadcast')) {
      sender = sender || message.key.remoteJid;
    }
    
    message.key.remoteJid = jid;
    message.key.fromMe = sender === connection.user.id;
    
    return proto.WebMessageInfo.fromObject(message);
  };
  
  connection.getFile = async (input, saveFile) => {
    let response;
    let buffer = Buffer.isBuffer(input) ? input : 
                 /^data:.*?\/.*?;base64,/i.test(input) ? Buffer.from(input.split`,`[1], 'base64') : 
                 /^https?:\/\//.test(input) ? await (response = await getBuffer(input)) : 
                 fs.existsSync(input) ? (filePath = input, fs.readFileSync(input)) : 
                 typeof input === "string" ? input : Buffer.alloc(0);
    
    let fileInfo = (await FileType.fromBuffer(buffer)) || { mime: "application/octet-stream", ext: ".bin" };
    let filePath = "./temp/null." + fileInfo.ext;
    
    if (buffer && saveFile) {
      fs.promises.writeFile(filePath, buffer);
    }
    
    return {
      res: response,
      filename: filePath,
      size: getSizeMedia(buffer),
      ...fileInfo,
      data: buffer
    };
  };
  
  connection.sendFile = async (jid, file, fileName, options = { quoted: '' }, extraOptions = {}) => {
    let fileData = await connection.getFile(file, true);
    let { filename, size, ext, mime, data } = fileData;
    let messageType = '';
    let mimetype = mime;
    let finalFilename = filename;
    
    if (extraOptions.asDocument) messageType = 'document';
    
    if (extraOptions.asSticker || /webp/.test(mime)) {
      let { writeExif } = require("./sticker.js");
      let mediaObj = { mimetype: mime, data: data };
      finalFilename = await writeExif(mediaObj, {
        packname: Config.packname,
        author: Config.packname,
        categories: extraOptions.categories ? extraOptions.categories : []
      });
      await fs.promises.unlink(filename);
      messageType = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) {
      messageType = "image";
    } else if (/video/.test(mime)) {
      messageType = "video";
    } else if (/audio/.test(mime)) {
      messageType = "audio";
    } else {
      messageType = "document";
    }
    
    await connection.sendMessage(jid, {
      [messageType]: { url: finalFilename },
      mimetype: mimetype,
      fileName: fileName,
      ...extraOptions
    }, {
      quoted: options && options.quoted ? options.quoted : options,
      ...options
    });
    
    return fs.promises.unlink(finalFilename);
  };
  
  connection.fakeMessage = async (type = "text", keyOptions = {}, text = "➬ Empire Tech", messageOptions = {}) => {
    const randomNumbers = [777, 0, 100, 500, 1000, 999, 2021];
    let key = {
      id: connection.messageId(),
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      ...keyOptions
    };
    let message = {};
    
    if (type == "text" || type == "conversation" || !type) {
      message = { conversation: text };
    } else if (type == "order") {
      message = {
        orderMessage: {
          itemCount: randomNumbers[Math.floor(randomNumbers.length * Math.random())],
          status: 1,
          surface: 1,
          message: "❏ " + text,
          orderTitle: 'live',
          sellerJid: '2348078582627@s.whatsapp.net'
        }
      };
    } else if (type == "contact") {
      message = {
        contactMessage: {
          displayName: '' + text,
          jpegThumbnail: log0
        }
      };
    } else if (type == 'image') {
      message = {
        imageMessage: {
          jpegThumbnail: log0,
          caption: text
        }
      };
    } else if (type == "video") {
      message = {
        videoMessage: {
          url: log0,
          caption: text,
          mimetype: "video/mp4",
          fileLength: "4757228",
          seconds: 44
        }
      };
    }
    
    return {
      key: { ...key },
      message: { ...message, ...messageOptions }
    };
  };
  
  connection.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(match => match[1] + "@s.whatsapp.net");
  };
  
  // API endpoint for chat history
  app.get("/chat", (req, res) => {
    let chatId = req.query.chat || req.query.jid || connection.user.id || connection.user.m || '';
    
    if (["all", "msg", "total"].includes(chatId)) {
      return res.json({ chat: chatId, conversation: JSON.stringify(store, null, 2) });
    }
    
    if (!chatId) return res.json({ ERROR: "Chat Id parameter missing" });
    
    chatId = connection.decodeJid(chatId);
    const messages = (store.messages[chatId] || store.messages[chatId + "@s.whatsapp.net"] || store.messages[chatId + "@g.us"])?.array || false;
    
    if (!messages) {
      return res.json({ chat: chatId, Message: "no messages found in given chat id!" });
    }
    
    res.json({ chat: chatId, conversation: JSON.stringify(messages, null, 2) });
  });
  
  connection.dl_size = global.dl_size || 200;
  
  connection.awaitForMessage = async (options = {}) => {
    return new Promise((resolve, reject) => {
      if (typeof options !== "object") reject(new Error("Options must be an object"));
      if (typeof options.sender !== 'string') reject(new Error("Sender must be a string"));
      if (typeof options.remoteJid !== 'string') reject(new Error("ChatJid must be a string"));
      if (options.timeout && typeof options.timeout !== "number") reject(new Error("Timeout must be a number"));
      if (options.filter && typeof options.filter !== "function") reject(new Error("Filter must be a function"));
      
      const timeout = options?.timeout || undefined;
      const filter = options?.filter || (() => true);
      let timeoutId = undefined;
      
      let listener = (event) => {
        let { type, messages } = event;
        if (type == "notify") {
          for (let msg of messages) {
            const fromMe = msg.key.fromMe;
            const remoteJid = msg.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us');
            const isStatus = remoteJid == "status@broadcast";
            const sender = connection.decodeJid(fromMe ? connection.user.id : (isGroup || isStatus ? msg.key.participant : remoteJid));
            
            if (sender == options.sender && remoteJid == options.remoteJid && filter(msg)) {
              connection.ev.off('messages.upsert', listener);
              clearTimeout(timeoutId);
              resolve(msg);
            }
          }
        }
      };
      
      connection.ev.on('messages.upsert', listener);
      
      if (timeout) {
        timeoutId = setTimeout(() => {
          connection.ev.off("messages.upsert", listener);
          reject(new Error("Timeout"));
        }, timeout);
      }
    });
  };
  
  return connection;
}

let asciiArt = "\n\n                " + Config.VERSION + "\n█▀▀▀▀ █▀▄▀█ █▀▀▄ ▀█▀ █▀▀▄ █▀▀▀▀   █▀▄▀█ █▀▀▄\n█▀▀▀  █ █ █ █▄▄▀  █  █▄▄▀ █▀▀▀    █ █ █ █  █\n█▄▄▄▄ █   █ █    ▄█▄ █  █ █▄▄▄▄   █   █ █▄▄▀\n  𝗠𝗨𝗟𝗧𝗜𝗗𝗘𝗩𝗜𝗖𝗘 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗨𝗦𝗘𝗥 𝗕𝗢𝗧\n\n";
console.log(asciiArt);

global.lib_dir = __dirname;
global.toBool = (value, returnBool = false) => 
  /true|yes|ok|act|sure|enable|smd|empire/gi.test(value) ? 
    (returnBool ? true : "true") : 
    (returnBool ? false : "false");

function normalizeExternalPlugins(input = {}) {
  if (!input) return {};

  if (Array.isArray(input)) {
    return input.reduce((plugins, item, index) => {
      if (typeof item === "string") {
        plugins["plugin_" + index] = item;
      } else if (item && typeof item === "object") {
        const name = item.name || item.plugin || item.pattern || item.cmdname || item.command;
        const url = item.url || item.link || item.raw || item.gist;
        if (name && url) plugins[String(name).trim()] = String(url).trim();
      }
      return plugins;
    }, {});
  }

  if (typeof input === "object") {
    return Object.entries(input).reduce((plugins, [name, value]) => {
      if (typeof value === "string") {
        plugins[name] = value.trim();
      } else if (value && typeof value === "object") {
        const pluginName = value.name || value.plugin || value.pattern || value.cmdname || value.command || name;
        const url = value.url || value.link || value.raw || value.gist;
        if (pluginName && url) plugins[String(pluginName).trim()] = String(url).trim();
      }
      return plugins;
    }, {});
  }

  return {};
}

function loadPlugins(pluginDir) {
  try {
    fs.readdirSync(pluginDir).forEach(file => {
      const filePath = path.join(pluginDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        loadPlugins(filePath);
      } else {
        if (file.includes("_Baileys") || file.includes("_MSGS")) {
          return;
        } else {
          if (['.js', ".smd", '.empire'].includes(path.extname(file).toLowerCase())) {
            try {
              require(filePath);
            } catch (error) {
              log("\n❌There's an error in '" + file + "' file ❌ \n\n", error);
            }
          }
        }
      }
    });
  } catch (error) {}
}

// Express server setup
app.set("json spaces", 3);

app.get('/', (req, res) => {
  try {
    let indexPath = path.join(__dirname, 'assets', "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.type("html").send("HTML content with confetti and styling...");
    }
  } catch (error) {}
});

app.get("/empire", (req, res) => res.type("html").send("HTML content..."));
app.get('/var', (req, res) => {
  res.json({
    botname: Config.botname,
    version: Config.VERSION,
    mode: Config.WORKTYPE,
    uptime: runtime(process.uptime()),
    status: global.isStart ? "online" : "connecting"
  });
});

app.get("/qr", async (req, res) => {
  try {
    if (!global.qr) throw "QR NOT FETCHED!";
    let qrcode = require("qrcode");
    res.end(await qrcode.toBuffer(global.qr));
  } catch (error) {
    console.log("/qr PATH_URL Error : ", error);
    if (!res.headersSent) {
      res.send({
        error: error.message || error,
        reason: global.qr_message || "SERVER DOWN!",
        uptime: runtime(process.uptime())
      });
    }
  }
});

app.get("/logo", (req, res) => res.end(global.log0));

let port = Number(process.env.PORT) || Number(global.port) || 3000;
app.listen(port, "0.0.0.0", () => console.log("Aster-Md Server listening on port " + port));

global.print = console.log;
global.log = console.log;
global.Debug = { ...console };

// Log filtering
if (!/true|log|smd|error|logerror|err|all|info|loginfo|warn|logwarn/.test(global.MsgsInLog)) {
  console.log = () => {};
}
if (!/error|logerror|err|all/.test(global.MsgsInLog)) {
  console.error = () => {};
}
if (!/info|loginfo|all/.test(global.MsgsInLog)) {
  console.info = () => {};
}
if (!/warn|logwarn|all/.test(global.MsgsInLog)) {
  console.warn = () => {};
}

// Keep-alive URLs
let appUrls = [];
if (global.appUrl && /http/gi.test(global.appUrl)) {
  appUrls = [global.appUrl, "http://localhost:" + port];
}
if (process.env.REPL_ID) {
  appUrls.push("https://" + process.env.REPL_ID + ".pike.replit.dev");
  appUrls.push('https://' + process.env.REPL_ID + '.' + (process.env.REPLIT_CLUSTER || 'pike') + ".replit.dev");
}
if (process.env.REPL_SLUG) {
  appUrls.push('https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + ".repl.co");
}
if (process.env.PROJECT_DOMAIN) {
  appUrls.push("https://" + process.env.PROJECT_DOMAIN + ".glitch.me");
}
if (process.env.CODESPACE_NAME) {
  appUrls.push("https://" + process.env.CODESPACE_NAME + '.github.dev');
}

function keepAlive() {
  setInterval(() => {
    for (let i = 0; i < appUrls.length; i++) {
      const url = appUrls[i];
      if (/(\/\/|\.)undefined\./.test(url)) continue;
      try { axios.get(url); } catch (error) {}
      try { fetch(url); } catch (error) {}
    }
  }, 300000);
}

if (Array.isArray(appUrls)) keepAlive();

function parseMegaSessionId(sessionId) {
  let megaPath = String(sessionId || "").trim();
  if (!megaPath) return megaPath;

  if (megaPath.startsWith("https://mega.nz/file/")) {
    megaPath = megaPath.replace("https://mega.nz/file/", "");
  }

  // pair-example prefixes MEGA links with EMPIRE-MD× before sending to WhatsApp
  megaPath = megaPath.replace(/^EMPIRE-MD×/, "");
  return megaPath;
}

async function MakeSession(sessionId = Config.SESSION_ID, sessionDir = path.join(__dirname, "../session/")) {
  global.SmdOfficial = "yes";

  if (!sessionId || ["null", "false", ""].includes(sessionId)) {
    log("SESSION_ID is missing! Add your session id to SESSION_ID in config.js");
    return;
  }

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  if (!fs.existsSync(sessionDir + "creds.json")) {
    log("Checking Session ID!");
    try {
      const { File } = require("megajs");
      const megaPath = parseMegaSessionId(sessionId);
      const filer = File.fromURL(`https://mega.nz/file/${megaPath}`);
      await new Promise((resolve, reject) => {
        filer.download((err, data) => {
          if (err) {
            log("MEGA DOWNLOAD ERROR: " + err);
            return reject(err);
          }
          try {
            fs.writeFileSync(sessionDir + "creds.json", data);
            log("Credentials Saved Successfully.");
            resolve();
          } catch (writeErr) {
            log("ERROR WRITING SESSION FILE: " + writeErr);
            reject(writeErr);
          }
        });
      });
    } catch (error) {
      log("CAN'T GET SESSION FROM MEGA\nERROR : " + error);
    }
  }
}

async function main() {
  if ((global.mongodb || Config.MONGODB_URL) && String(global.mongodb || Config.MONGODB_URL).includes("mongodb")) {
    try { global.isMongodb = await connectMongo(); } catch {}
  }
  if (!global.isMongodb && global.DATABASE_URL && !["false", "null"].includes(global.DATABASE_URL)) {
    try { global.sqldb = await connectPg(); } catch {}
  }
}

module.exports = {
  init: MakeSession,
  connect: syncdb,
  logger: global.Debug,
  DATABASE: { sync: main }
};
