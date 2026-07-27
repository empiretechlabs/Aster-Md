const { 
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
  makeInMemoryStore
} = require('baileys-pro');


const events = require('./lib/command');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp, downloadMediaMessage
} = require("./lib");
const { sms, DownloadMediaMessage } = require("./lib/functions/msg");
const { Boom } = require ('@hapi/boom');
const fs = require('fs');
const P = require('pino');
const path = require('path');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const axios = require('axios');
const jimp = require('jimp');
const { File } = require('megajs');
const { exec } = require("child_process");
const mode = config.MODE;
const prefix = config.PREFIX;
const ownerNumber = [config.OWNER_NUMBER];
const ownerName = [config.OWNER_NAME];
const ffmpeg = require('fluent-ffmpeg');
const afkNotified = new Set();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

require("events").EventEmitter.defaultMaxListeners = 1000;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [
    h ? `${h}h` : null,
    m ? `${m}m` : null,
    s ? `${s}s` : null,
  ].filter(Boolean).join(' ') || '0s';
}

let asciii = `
${config.VERSION}
███████╗███╗   ███╗██████╗ ██╗██████╗ ███████╗    ███╗   ███╗██████╗
██╔════╝████╗ ████║██╔══██╗██║██╔══██╗██╔════╝    ████╗ ████║██╔══██╗
█████╗  ██╔████╔██║██████╔╝██║██████╔╝█████╗      ██╔████╔██║██║  ██║
██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║██╔══██╗██╔══╝      ██║╚██╔╝██║██║  ██║
███████╗██║ ╚═╝ ██║██║     ██║██║  ██║███████╗    ██║ ╚═╝ ██║██████╔╝
╚══════╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚═════╝

        𝗘𝗠𝗣𝗜𝗥𝗘 𝗠𝗗 — 𝗠𝗨𝗟𝗧𝗜𝗗𝗘𝗩𝗜𝗖𝗘 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗕𝗢𝗧
`;

console.log(asciii);
console.log("Checking Session ID!");

if (!fs.existsSync(__dirname + '/session/creds.json')) {
  if(!config.SESSION_ID) return console.log('Add your session id to SESSION_ID in config.js !!');
  const sessdata = config.SESSION_ID;
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
      if(err) throw err;
      fs.writeFile(__dirname + '/session/creds.json', data, () => {
          console.log("Credentials Saved Successfully.");
      });
  });
}

/* ================= STORE ================= */

const store = makeInMemoryStore({
  logger: P({ level: "silent" })
});

 try {
    const raw = fs.readFileSync("./store.json", "utf8").trim();
    const data = raw ? JSON.parse(raw) : null;
    if (data && Array.isArray(data.chats)) store.readFromFile("./store.json");
  } catch (e) {
    console.warn("⚠️ Could not load store.json (using fresh store):", e.message);
  }

setInterval(() => {
  store.writeToFile("./store.json");
}, 30_000);


async function connectToWA() {
  const connectDB = require("./lib/mongodb");
  const dbType = await connectDB();

  console.log("⏳ Database syncing!");
  console.log("ℹ️ Connecting to WhatsApp!");

  const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/session/");
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    markOnlineOnConnect: false,
    defaultQueryTimeoutMs: 60000,
    fireInitQueries: true,
    msgRetryCounterCache: new Map(),
    auth: state,
    version,
  });

  store.bind(conn.ev);

  const antideleteMap = new Map();
  const ANTIDELETE_MAX = 300;

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      } else {
        console.log("❌ Logged out from Empire_Md");
      }
    }

    if (connection === "open") {
      console.log("✅ Whatsapp Login Successful!");

      const path = require("path");
      console.log("⏳ Checking External Plugins..!!");
      fs.readdirSync("./commands/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require("./commands/" + plugin);
        }
      });

      console.log("✅ External Plugins Installed!");

      const events = require("./lib/command");
      const totalCommands = Array.isArray(events.commands) ? events.commands.length : 0;

      const dbLabel = dbType === "mongodb" ? "MongoDB" : dbType === "postgres" ? "PostgreSQL" : "JSON";

      const up = `
 Empire_Md Connected

 Prefix   : [ ${prefix} ]
 Plugins  : ${totalCommands}
 Mode     : ${monospace(mode)}
 Database : ${dbLabel}

 Subscribe To YouTube
 youtube.com/@only_one_empire`;

      console.log(up);
      conn.sendMessage(`${ownerNumber}@s.whatsapp.net`, { text: up });
    }
  });


conn.ev.on('group-participants.update', async (update) => {
  if (!update || typeof update !== 'object') return;

  const groupId = update.id;
  const participants = update.participants || [];
  const action = update.action;

  if (action !== 'add' || !groupId || participants.length === 0) return;

  let groupMetadata, groupName = '', groupDescription = '', participantCount = 0;

  try {
    groupMetadata = await conn.groupMetadata(groupId);
    groupName = groupMetadata?.subject || 'Unknown Group';
    groupDescription = groupMetadata?.desc || 'No description available.';
    participantCount = groupMetadata?.participants?.length || 0;
  } catch (e) {
    console.error('❌ Error fetching group metadata (welcome):', e);
    return;
  }

  let groupData;
  try {
    groupData = await sck.findOne({ id: groupId });
    if (!groupData) return;
    if (groupData.botenable === "false") return;
  } catch (err) {
    console.error('❌ MongoDB Welcome error:', err);
    return;
  }

  for (const participant of participants) {
    const userJid = participant;
    const userNumber = userJid.split('@')[0];

    let ppUrl = 'https://files.catbox.moe/lps6ow.jpg';
    try {
      ppUrl = await conn.profilePictureUrl(userJid, 'image');
    } catch {}

    const message = groupData.welcome
      ?.replace(/@user/g, `@${userNumber}`)
      .replace(/@gname/g, groupName)
      .replace(/@count/g, participantCount)
      .replace(/@pp/g, '');

    const defaultCaption =
      `🎉 *Welcome to ${groupName}!* 🎉\n\n` +
      `👤 @${userNumber} joined the group!\n\n` +
      `👥 *Total Members:* ${participantCount}\n` +
      `📌 *Description:* ${groupDescription}`;

    await conn.sendMessage(
      groupId,
      {
        image: { url: ppUrl },
        caption: message || defaultCaption,
        mentions: [userJid]
      }
    );
  }
});

conn.ev.on('group-participants.update', async (update) => {
  if (!update || typeof update !== 'object') return;

  const groupId = update.id;
  const participants = update.participants || [];
  const action = update.action;

  if (action !== 'remove' || !groupId || participants.length === 0) return;

  let groupMetadata, groupName = '', groupDescription = '', participantCount = 0;

  try {
    groupMetadata = await conn.groupMetadata(groupId);
    groupName = groupMetadata?.subject || 'Unknown Group';
    groupDescription = groupMetadata?.desc || 'No description available.';
    participantCount = groupMetadata?.participants?.length || 0;
  } catch (e) {
    console.error('❌ Error fetching group metadata (goodbye):', e);
    return;
  }

  let groupData;
  try {
    groupData = await sck.findOne({ id: groupId });
    if (!groupData) return;
    if (groupData.botenable === "false") return;
  } catch (err) {
    console.error('❌ MongoDB Goodbye error:', err);
    return;
  }

  for (const participant of participants) {
    const userJid = participant;
    const userNumber = userJid.split('@')[0];

    let ppUrl = 'https://files.catbox.moe/lps6ow.jpg';
    try {
      ppUrl = await conn.profilePictureUrl(userJid, 'image');
    } catch {}

    const message = groupData.goodbye
      ?.replace(/@user/g, `@${userNumber}`)
      .replace(/@gname/g, groupName)
      .replace(/@count/g, participantCount)
      .replace(/@pp/g, '');

    const defaultCaption =
      `😢 *Goodbye from ${groupName}!* 😢\n\n` +
      `👤 @${userNumber} left the group.\n\n` +
      `👥 *Total Members:* ${participantCount}\n` +
      `📌 *Description:* ${groupDescription}`;

    await conn.sendMessage(
      groupId,
      {
        image: { url: ppUrl },
        caption: message || defaultCaption,
        mentions: [userJid]
      }
    );
  }
});

conn.ev.on("messages.upsert", async ({ messages }) => {  
  try {  
    const m = messages[0];  
    if (!m.message || !m.key.remoteJid || m.key.fromMe) return;  

    const from = m.key.remoteJid;  
    if (from === "status@broadcast") return;  

    const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    let user = await sck1.findOne({ id: botId });

    if (!user) {
      user = await sck1.create({ id: botId });
    }

    if (user.autoreact !== "true") return;

    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    await doReact(emoji, m, conn);

  } catch (e) {  
    console.error("AutoReact Error:", e);  
  }  
});

conn.ev.on("call", async (calls) => {
  try {
    const call = calls[0];
    if (!call) return;

    if (call.status !== "offer") return;

    const jid = call.from;
    const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    let user = await sck1.findOne({ id: botId });

    if (!user) {
      user = await sck1.create({ id: botId });
    }

    if (user.anticall !== "true") return;

    await conn.rejectCall(
      call.id,
      call.from,
      call.isGroup,
      call.participants
    );

    await conn.sendMessage(jid, {
      text: "🚫 Calls are not allowed.\nYour call was auto-declined."
    });

  } catch (e) {
    console.error("AntiCall Error:", e);
  }
});

conn.ev.on("messages.delete", async (deleteData) => {
  try {
    const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    let botUser = await sck1.findOne({ id: botId });
    const mode = botUser?.antidelete || "false";
    if (mode !== "dm" && mode !== "public") return;

    const keys = deleteData?.keys || (Array.isArray(deleteData) ? deleteData : []);
    if (!keys.length) return;

    const ownerJid = `${config.OWNER_NUMBER.replace(/^\+/, "")}@s.whatsapp.net`;

    for (const key of keys) {
      if (key.fromMe) continue;
      const jid = key.remoteJid;
      const id = key.id;
      if (!jid || !id) continue;

      const mapKey = `${jid}_${id}`;
      const stored = antideleteMap.get(mapKey);
      antideleteMap.delete(mapKey);

      if (!stored || !stored.text) continue;

      const senderNum = (stored.sender || key.participant || "").split("@")[0];
      const caption = senderNum
        ? `🗑️ *Deleted message* from @${senderNum}:\n\n${stored.text}`
        : `🗑️ *Deleted message:*\n\n${stored.text}`;

      if (mode === "dm") {
        await conn.sendMessage(ownerJid, {
          text: `*Chat:* ${jid}\n\n${caption}`,
          mentions: stored.sender ? [stored.sender] : []
        });
      } else {
        await conn.sendMessage(jid, {
          text: caption,
          mentions: stored.sender ? [stored.sender] : []
        });
      }
    }
  } catch (e) {
    console.error("Antidelete Error:", e);
  }
});



conn.ev.on("messages.upsert", async ({ messages }) => {
  try {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    if (!m.key.remoteJid.endsWith("@g.us")) return;

    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    const mentions =
      m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (mentions.length === 0) return;

    const groupData = await sck.findOne({ id: from });
    if (!groupData || !groupData.antitag || groupData.antitag === "off") return;

    const metadata = await conn.groupMetadata(from);
    const groupAdmins = metadata.participants
      .filter(p => p.admin !== null)
      .map(p => p.id);

    const botNumber =
      conn.user.id.split(":")[0] + "@s.whatsapp.net";

    const isBotAdmins = groupAdmins.includes(botNumber);
    const isAdmin = groupAdmins.includes(sender);

    if (isAdmin) return;

    await conn.sendMessage(from, { delete: m.key });

    switch (groupData.antitag) {

      case "delete":
        return;

      case "kick":
        if (!isBotAdmins) return;

        await conn.groupParticipantsUpdate(from, [sender], "remove");

        await conn.sendMessage(from, {
          text: `🚫 @${sender.split("@")[0]} was removed for tagging users.`,
          mentions: [sender]
        });
        return;

      case "warn":

        const warns = await warndb.find({
          id: sender,
          group: from
        });

        const warnCount = warns.length + 1;

        await warndb.create({
          id: sender,
          group: from,
          reason: "Tagging users",
          warnedby: botNumber,
          date: Date.now()
        });

        if (warnCount >= 3) {
          if (!isBotAdmins) return;

          await conn.groupParticipantsUpdate(from, [sender], "remove");

          await conn.sendMessage(from, {
            text: `❌ @${sender.split("@")[0]} removed after 3 tag warnings.`,
            mentions: [sender]
          });

          await warndb.deleteMany({
            id: sender,
            group: from
          });

        } else {
          await conn.sendMessage(from, {
            text: `⚠️ @${sender.split("@")[0]} warned (${warnCount}/3) for tagging.`,
            mentions: [sender]
          });
        }

        return;
    }

  } catch (e) {
    console.error("AntiTag Error:", e);
  }
});

conn.ev.on("messages.upsert", async ({ messages }) => {
  try {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    if (!from || !from.endsWith("@g.us")) return;

    const sender = m.key.participant || m.key.remoteJid;
    const senderNumber = sender.split("@")[0];

    const msgText =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    if (!isUrl(msgText)) return;

    const groupData = await sck.findOne({ id: from });
    if (!groupData || !groupData.antilink || groupData.antilink === "off") return;

    const metadata = await conn.groupMetadata(from);
    const groupAdmins = metadata.participants
      .filter(p => p.admin !== null)
      .map(p => p.id);

    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmins = groupAdmins.includes(botNumber);
    const isAdmin = groupAdmins.includes(sender);

    if (isAdmin) return;

    await conn.sendMessage(from, { delete: m.key });

    await conn.sendMessage(from, {
      text: `🚫 @${senderNumber} links are not allowed here.`,
      mentions: [sender]
    });

    switch (groupData.antilink) {

      case "delete":
        return;

      case "kick":
        if (!isBotAdmins) return;
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        await conn.sendMessage(from, {
          text: `🚫 @${senderNumber} was removed for posting a link.`,
          mentions: [sender]
        });
        return;

      case "warn":
        const warns = await warndb.find({ id: sender, group: from });
        const warnCount = warns.length + 1;

        await warndb.create({
          id: sender,
          group: from,
          reason: "Posted a link",
          warnedby: botNumber,
          date: Date.now()
        });

        if (warnCount >= 3) {
          if (!isBotAdmins) return;

          await conn.groupParticipantsUpdate(from, [sender], "remove");

          await conn.sendMessage(from, {
            text: `❌ @${senderNumber} removed after 3 link warnings.`,
            mentions: [sender]
          });

          await warndb.deleteMany({ id: sender, group: from });
        } else {
          await conn.sendMessage(from, {
            text: `⚠️ @${senderNumber} warned (${warnCount}/3) for link.`,
            mentions: [sender]
          });
        }
        return;
    }

  } catch (e) {
    console.error("Antilink Error:", e);
  }
});

conn.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  if (!m.message) return;

  const sender = m.key.participant || m.key.remoteJid;
  const chat = m.key.remoteJid;
  const fromMe = m.key.fromMe;

  const reply = (text) =>
    conn.sendMessage(chat, { text }, { quoted: m });

  // ─── Auto un-AFK when sender (user who set AFK) sends a message ───
  if (!fromMe) {
    const userWhoSent = await sck1.findOne({ id: sender });
    if (userWhoSent && userWhoSent.afk && userWhoSent.afk !== "false") {
      const afkDuration = Date.now() - (userWhoSent.afktime || 0);
      await sck1.updateOne(
        { id: sender },
        { afk: "false", afktime: 0 }
      );
      await reply(
        `✅ Welcome back! You were AFK for ${clockString(afkDuration)}.`
      );
    }
  }

  // ─── Notify if mentioned or replied user is AFK ───
  const mentionUser = [
    ...new Set([
      ...(m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []),
      ...(m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ? [m.message.extendedTextMessage.contextInfo.participant]
        : []),
    ]),
  ].filter(Boolean);

  for (let jid of mentionUser) {
    const key = `${chat}:${jid}`;
    if (afkNotified.has(key)) continue;

    const user = await sck1.findOne({ id: jid });

    if (!user || !user.afk || user.afk === "false") continue;

    const afkDuration = Date.now() - (user.afktime || 0);
    const reasonText = user.afk ? `\n💬 Reason: ${user.afk}` : "";

    await reply(
      `⚠️ That user is currently AFK.${reasonText}\n⏱️ Since: ${clockString(afkDuration)} ago.`
    );

    afkNotified.add(key);
    setTimeout(() => afkNotified.delete(key), 3000);
  }
});

conn.ev.on('messages.upsert', async(mek) => {
    mek = mek.messages[0]
    if (mek.key && mek.key.remoteJid === "status@broadcast") {
    try {

        if (config.AUTO_VIEW_STATUS === "true" && mek.key) {
            await conn.readMessages([mek.key]);
        }
        // Auto like status
        if (config.AUTO_LIKE_STATUS === "true") {
            let emojiToUse;

            if (config.AUTO_LIKE_EMOJI === 'random') {
                const randomIndex = Math.floor(Math.random() * emojis.length);
                emojiToUse = emojis[randomIndex];
            } else {
                emojiToUse = config.AUTO_LIKE_EMOJI || "🙂";
            }

            if (mek.key.remoteJid && mek.key.participant) {
                await conn.sendMessage(
                    mek.key.remoteJid,
                    { react: { key: mek.key, text: emojiToUse } },
                    { statusJidList: [mek.key.participant] }
                );
            }
        }
    } catch (error) {
        console.error("Error processing status actions:", error);
    }
}

const m = sms(conn, mek)
const type = getContentType(mek.message)
const content = JSON.stringify(mek.message)
const from = mek.key.remoteJid
if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
  try {
    const botIdVv = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    let botUserVv = await sck1.findOne({ id: botIdVv });
    const antivvMode = botUserVv?.antivv || "false";
    if (antivvMode === "dm" || antivvMode === "public") {
      const vo = mek.message.viewOnceMessageV2 || mek.message.viewOnceMessage;
      if (vo?.message) {
        const inner = vo.message;
        const mediaMsg = inner.imageMessage || inner.videoMessage || inner.audioMessage;
        if (mediaMsg) {
          const fakeM = {
            msg: mediaMsg,
            type: inner.imageMessage ? 'imageMessage' : inner.videoMessage ? 'videoMessage' : 'audioMessage'
          };
          const buffer = await downloadMediaMessage(fakeM);
          const cap = mediaMsg.caption || '';
          const ownerJid = `${String(config.OWNER_NUMBER || "").replace(/^\+/, "")}@s.whatsapp.net`;
          const chatJid = mek.key.remoteJid;
          if (antivvMode === "dm" && ownerJid) {
            const capDm = `*Chat:* ${chatJid}\n\n${cap}`;
            if (fakeM.type === 'imageMessage') await conn.sendMessage(ownerJid, { image: buffer, caption: capDm });
            else if (fakeM.type === 'videoMessage') await conn.sendMessage(ownerJid, { video: buffer, caption: capDm });
            else await conn.sendMessage(ownerJid, { audio: buffer, ptt: !!mediaMsg.ptt });
          } else if (antivvMode === "public") {
            if (fakeM.type === 'imageMessage') await conn.sendMessage(chatJid, { image: buffer, caption: cap });
            else if (fakeM.type === 'videoMessage') await conn.sendMessage(chatJid, { video: buffer, caption: cap });
            else await conn.sendMessage(chatJid, { audio: buffer, ptt: !!mediaMsg.ptt });
          }
        }
      }
    }
  } catch (err) {
    console.error("Antivv Error:", err);
  }
}
const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
const body =
  (type === 'conversation') ? mek.message.conversation :
  (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
  (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption :
  (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption :
  (type === 'buttonsResponseMessage') ? mek.message.buttonsResponseMessage.selectedButtonId :
  (type === 'templateButtonReplyMessage') ? mek.message.templateButtonReplyMessage.selectedId :
  '';
const isCmd = body.startsWith(prefix)
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isGroup = from.endsWith('@g.us')
const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
const senderNumber = sender.split('@')[0]
const botIdForAntidelete = conn.user.id.split(":")[0] + "@s.whatsapp.net";
let botUserAntidelete = await sck1.findOne({ id: botIdForAntidelete });
const antideleteMode = botUserAntidelete?.antidelete || "false";
if ((antideleteMode === "dm" || antideleteMode === "public") && !mek.key.fromMe && mek.key.remoteJid && mek.key.id && body && (type === 'conversation' || type === 'extendedTextMessage')) {
  const k = `${mek.key.remoteJid}_${mek.key.id}`;
  antideleteMap.set(k, { text: body, sender });
  if (antideleteMap.size > ANTIDELETE_MAX) {
    const firstKey = antideleteMap.keys().next().value;
    antideleteMap.delete(firstKey);
  }
}
const pushname = mek.pushName || '𝖤𝗆𝗉𝗂𝗋𝖾 𝖳𝖾𝖼𝗁'
const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
const isMe = botNumber.includes(senderNumber)
const isOwner = ownerNumber.includes(senderNumber) || isMe
const botNumber2 = await jidNormalizedUser(conn.user.id);
let groupMetadata = null;
let groupName = '';
let participants = [];

if (isGroup) {
    try {
        groupMetadata = await conn.groupMetadata(from);
        groupName = groupMetadata.subject || '';
        participants = groupMetadata.participants || [];
    } catch (e) {
        console.error('❌ Error fetching group metadata:', e.message);
    }
}
const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
const isAdmins = isGroup ? groupAdmins.includes(sender) : false
const reply = (teks, opts = {}) => {
  conn.sendMessage(from, { text: teks, ...opts }, { quoted: mek });
};



if (body.startsWith("$") && isOwner) {
  try {
    if (!q) return reply("Provide a valid command!");

    let result = await eval(q);
    if (typeof result !== "string") result = require("util").inspect(result);

    reply(`${result}`);
  } catch (e) {
    reply(`${e.message}`);
  }
}

if (body.startsWith(">") && isOwner) {
  try {
    if (!q) return reply(" Provide a valid command to run");

    exec(q, (err, stdout, stderr) => {
      if (err) return reply(`${err.message}`);
      if (stderr) return reply(`${stderr}`);
      reply(`${stdout}`);
    });
  } catch (e) {
    reply(`${e.message}`);
  }
}


conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
              let mime = '';
              let res = await axios.head(url)
              mime = res.headers['content-type']
              if (mime.split("/")[1] === "gif") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
              }
              let type = mime.split("/")[0] + "Message"
              if (mime === "application/pdf") {
                return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
              }
              if (mime.split("/")[0] === "image") {
                return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
              }
              if (mime.split("/")[0] === "video") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
              }
              if (mime.split("/")[0] === "audio") {
                return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
              }
            }


//===================WORKTYPE===============================
if(!isOwner && config.MODE === "private") return
if(!isOwner && isGroup && config.MODE === "inbox") return
if(!isOwner && isGroup && config.MODE === "groups") return
//==================================================

const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
if (isCmd) {
const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
if (cmd) {
if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})

try {
cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
} catch (e) {
console.error("[PLUGIN ERROR] " + e);
}
}
}
// Game moves (TTT cell 1–9, WCG words) without prefix
if (!isCmd && body) {
  try {
    const gamesModule = require("./commands/games");
    if (gamesModule.handleGameMessage && await gamesModule.handleGameMessage(conn, from, sender, body, reply, mek)) return;
  } catch (e) {
    console.error("[Games]", e);
  }
}
events.commands.map(async(command) => {
if (body && command.on === "body") {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (mek.q && command.on === "text") {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
(command.on === "image" || command.on === "photo") &&
mek.type === "imageMessage"
) {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
command.on === "sticker" &&
mek.type === "stickerMessage"
) {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
}});

})
}
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/lib/assets/empire.html");
});
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
setTimeout(() => {
connectToWA()
}, 4000);
