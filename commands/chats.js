/**
 Copyright (C) 2026
 Licensed under the  GPL-3.0 License;
 You may not use this file except in compliance with the License.
 It is supplied in the hope that it may be useful.
 * @project_name : Empire-Md
 * @author : efeurhobobullish <https://github.com/efeurhobobullish>
 * @description : Empire-Md ,A Multi-functional whatsapp bot.
 * @version 0.0.2
 **/
const theme = require('../Themes/Empire_Md.json');
const t = theme.STRINGS.global;
const config = require('../config');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");


// Archive command

cmd({
    pattern: "archive",
    desc: "Archive a chat",
    category: "chats",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { archive: true });  
        
        reply(t.success);
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

//unarchive 

cmd({
    pattern: "unarchive",
    desc: "unarchive a chat",
    category: "chats",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { archive: false });  
        reply(t.success);
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Clear command
 cmd({
    pattern: "clear",
    desc: "Clear all bot messages from all chats.",
    category: "chats",
    react: "🧹",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);

    try {
        const messages = conn.wsStore.messages;

        for (const jid of messages.keys()) {
            const chatMsgs = messages.get(jid);

            if (!chatMsgs) continue;

            for (const msg of chatMsgs.values()) {
                if (msg?.key?.fromMe && msg.key.id) {
                    await conn.sendMessage(jid, {
                        delete: {
                            remoteJid: jid,
                            fromMe: true,
                            id: msg.key.id,
                            participant: conn.user.id
                        }
                    });
                }
            }
        }

        reply("✅ Cleared all bot messages.");
       } catch (e) {

        console.log(e);

        reply(`${e}`);

    }

});

// Mark Read command
cmd({
    pattern: "markread",
    desc: "Mark a chat as read",
    category: "chats",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
     if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { markRead: true });
        reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Mark Unread command
cmd({
    pattern: "markunread",
    desc: "Mark a chat as unread",
    category: "chats",
    react: "🔔",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
     if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { markRead: false });
        reply(t.success);
       } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// archive command
cmd({
    pattern: "archive",
    desc: "archive a chat",
    category: "chats",
    react: "📂",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { archive: true });
        reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


// Unmute Chat command
cmd({
    pattern: "mutechat",
    desc: "mute a chat",
    category: "chats",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { mute: true });
        reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Unmute Chat command
cmd({
    pattern: "unmutechat",
    desc: "Unmute a chat",
    category: "chats",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { mute: false });
        reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Unpin command
cmd({
    pattern: "unpin",
    desc: "Unpin a Specific Chat",
    category: "chats",
    react: "❌",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { pin: false });
        reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Pin command
cmd({
    pattern: "pin",
    desc: "Pin a Specific Chat",
    category: "chats",
    react: "📌",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(t.owner);
    try {
        await conn.chatModify(from, { pin: true });
        reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
