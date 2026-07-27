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

const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const config = require('../config');
const fs = require('fs');
const exec = require('child_process');
const path = require('path');
const ownerNumber = [config.OWNER_NUMBER];
const prefix = config.PREFIX;
const axios = require("axios");
let bioIntervalRunning = false;

cmd({
  pattern: "afk",
  desc: "Set AFK status",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { sender, args, reply }) => {

  const reason = args.join(" ") || "I am AFK";

  try {
    await sck1.findOneAndUpdate(
      { id: sender },
      {
        afk: reason,
        afktime: Date.now()
      },
      { upsert: true, new: true }
    );

    return reply(`✅ You are now AFK: ${reason}`);
  } catch (e) {
    console.error(e);
    return reply("❌ Failed to set AFK.");
  }

});


cmd({
  pattern: "unafk",
  desc: "Cancel your AFK status manually",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { sender, reply }) => {

  try {
    const user = await sck1.findOne({ id: sender });

    if (!user || !user.afk || user.afk === "false") {
      return reply("❌ You are not AFK right now.");
    }

    await sck1.updateOne(
      { id: sender },
      {
        afk: "false",
        afktime: 0
      }
    );

    return reply("✅ Your AFK status has been removed. Welcome back!");
  } catch (e) {
    console.error(e);
    return reply("❌ Failed to remove AFK.");
  }

});

cmd({
  pattern: "autobio",
  desc: "Enable automatic bio updates.",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { args, isOwner, sender, reply }) => {

  if (!isOwner) return reply("❌ You are not authorized.")

  const validTypes = ["quote", "rizz", "insult", "motivation"]
  const input = (args[0] || "").replace("@", "").toLowerCase()

  try {

    if (input === "off") {

      await sck1.findOneAndUpdate(
        { id: sender },
        { autobio: "false" },
        { upsert: true }
      )

      return reply("✅ Autobio disabled.")
    }

    if (!validTypes.includes(input)) {
      return reply("❗ Usage:\n.autobio quote\n.autobio rizz\n.autobio insult\n.autobio motivation\n.autobio off")
    }

    await sck1.findOneAndUpdate(
      { id: sender },
      {
        autobio: "true",
        autobio_type: input
      },
      { upsert: true }
    )

    startAutoBio(conn, sender)

    return reply(`✅ Autobio enabled with ${input}.`)

  } catch (err) {
    console.error("Autobio command error:", err)
    return reply("❌ Internal error occurred.")
  }

})

async function startAutoBio(conn, ownerId) {

  if (bioIntervalRunning) return
  bioIntervalRunning = true

  setInterval(async () => {

    try {

      const user = await sck1.findOne({ id: ownerId })

      if (!user) return
      if (user.autobio !== "true") return

      const text = await fetchBioText(user.autobio_type)

      await conn.updateProfileStatus(text)

    } catch (err) {
      console.error("Bio update error:", err.message)
    }

  }, 60000)

}

async function fetchBioText(type) {

  try {

    let url = ""

    switch (type) {
      case "quote":
        url = "https://api.quotable.io/random"
        break
      case "rizz":
        url = "https://api.popcat.xyz/pickuplines"
        break
      case "insult":
        url = "https://api.empiretech.biz.id/api/fun/insult?apikey=CBfmvL"
        break
      case "motivation":
        url = "https://api.empiretech.biz.id/api/fun/motivation?apikey=CBfmvL"
        break
    }

    const res = await axios.get(url)

    if (type === "quote") return res.data.content
    if (type === "rizz") return res.data.pickupline
    if (type === "insult") return res.data.insult
    if (type === "motivation") return res.data.motivation

    return "Empire_Md"

  } catch (err) {
    console.error("Fetch error:", err.message)
    return "Empire_Md"
  }

}
 
//--------------------------------------------
//  BLOCK COMMANDS
//--------------------------------------------
cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, q, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!mek.quoted) return reply("❌ Please reply to the user you want to block.");

    const user = mek.quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'block');
        reply('🚫 User ' + user + ' blocked successfully.');
    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: `❌ Failed to block the user: ${err.message}` }, { quoted: mek });
    }
});
//--------------------------------------------
// UN-BLOCK COMMANDS
//--------------------------------------------
cmd({
    pattern: "unblock",
    desc: "Unblock a user.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, q, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!mek.quoted) return reply("❌ Please reply to the user you want to unblock.");

    const user = mek.quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'unblock');
        reply('✅ User ' + user + ' unblocked successfully.');
    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: `❌ Failed to unblock the user: ${err.message}` }, { quoted: mek });
    }
});

cmd({
    pattern: "readmore",
    desc: "Adds *readmore* in given text.",
    category: "owner",
    filename: __filename
}, 
async (conn, mek, m, { q }) => {
    if (!q) return await conn.sendMessage(m.chat, { text: "❌ Please provide text to apply readmore!" }, { quoted: mek });

    const readMore = String.fromCharCode(8206).repeat(4001);
    const result = q.replace(/\+/g, readMore);

    await conn.sendMessage(m.chat, { text: result }, { quoted: mek });
});

//--------------------------------------------
//  OWNER COMMANDS
//--------------------------------------------
cmd({
    pattern: "owner",
    desc: "Sends the owner's VCard.",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const number = config.OWNER_NUMBER || "+2348078582627";
        const name = config.OWNER_NAME || "𝙴𝚖𝚙𝚒𝚛𝚎 𝚃𝚎𝚌𝚑";
        const info = global.botname || "𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳";

        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${info};\nTEL;type=CELL;type=VOICE;waid=${number.replace("+", "")}:${number}\nEND:VCARD`;

        await conn.sendMessage(from, { 
            contacts: { 
                displayName: name, 
                contacts: [{ vcard }] 
            },
            contextInfo: {
    externalAdReply: {
        title: global.botname || "𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳",
        body: "𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝚝𝚑𝚎 𝚘𝚠𝚗𝚎𝚛",
        renderLargerThumbnail: true,
        thumbnailUrl: "https://files.catbox.moe/z7c67w.jpg",
        mediaType: 2,
        sourceUrl: `https://wa.me/${number.replace("+", "")}?text=Hello, I am ${pushname}`
    }
}
        }, { quoted: mek });
    } catch (error) {
        console.error("Error in owner command:", error);
        reply("❌ An error occurred while sending the VCard.");
    }
});

cmd({
    pattern: "antidelete",
    desc: "Anti-delete: dm (send to owner) | public (resend in chat) | off. Usage: .antidelete dm | public | off",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const arg = (args[0] || "").toLowerCase();

    if (arg !== "dm" && arg !== "public" && arg !== "off" && arg !== "false") {
        let botUser = await sck1.findOne({ id: botId });
        const current = botUser?.antidelete || "false";
        const currentLabel = current === "dm" ? "DM (to owner)" : current === "public" ? "Public (resend in chat)" : "OFF";
        return reply(
            `🗑️ *Antidelete* is currently *${currentLabel}*.\n\n` +
            `Usage:\n\`.antidelete dm\` – send deleted messages to owner\n\`.antidelete public\` – resend in same chat\n\`.antidelete off\` – disable`
        );
    }

    const value = arg === "off" || arg === "false" ? "false" : arg;
    try {
        await sck1.findOneAndUpdate(
            { id: botId },
            { antidelete: value },
            { upsert: true, new: true }
        );
        const label = value === "dm" ? "DM (deleted messages will be sent to you)" : value === "public" ? "Public (deleted messages will be resent in chat)" : "OFF";
        return reply(`✅ Antidelete set to *${label}*.`);
    } catch (e) {
        console.error(e);
        return reply("❌ Failed to update antidelete setting.");
    }
});

cmd({
    pattern: "antivv",
    desc: "Anti view-once: dm (forward to owner) | public (resend in chat) | off. Usage: .antivv dm | public | off",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const arg = (args[0] || "").toLowerCase();

    if (arg !== "dm" && arg !== "public" && arg !== "off" && arg !== "false") {
        let botUser = await sck1.findOne({ id: botId });
        const current = botUser?.antivv || "false";
        const currentLabel = current === "dm" ? "DM (to owner)" : current === "public" ? "Public (resend in chat)" : "OFF";
        return reply(
            `👀 *Antivv* is currently *${currentLabel}*.\n\n` +
            `Usage:\n\`.antivv dm\` – forward view-once to owner\n\`.antivv public\` – resend in same chat\n\`.antivv off\` – disable`
        );
    }

    const value = arg === "off" || arg === "false" ? "false" : arg;
    try {
        await sck1.findOneAndUpdate(
            { id: botId },
            { antivv: value },
            { upsert: true, new: true }
        );
        const label = value === "dm" ? "DM (view-once will be sent to you)" : value === "public" ? "Public (view-once will be resent in chat)" : "OFF";
        return reply(`✅ Antivv set to *${label}*.`);
    } catch (e) {
        console.error(e);
        return reply("❌ Failed to update antivv setting.");
    }
});

//--------------------------------------------
//  DEVELOPER COMMANDS
//--------------------------------------------
cmd({
    pattern: "developer",
    desc: "Sends the developer VCard.",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const number = global.devs || "2348078582627";
        const name = "𝙴𝚖𝚙𝚒𝚛𝚎 𝚃𝚎𝚌𝚑";
        const info = global.botname || "𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳";

        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${info};\nTEL;type=CELL;type=VOICE;waid=${number.replace("+", "")}:${number}\nEND:VCARD`;

        await conn.sendMessage(from, { 
            contacts: { 
                displayName: name, 
                contacts: [{ vcard }] 
            },
            contextInfo: {
    externalAdReply: {
        title: global.botname || "𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳",
        body: "𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝚝𝚑𝚎 𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚛",
        renderLargerThumbnail: true,
        thumbnailUrl: "https://files.catbox.moe/z7c67w.jpg",
        mediaType: 2,
        sourceUrl: `https://wa.me/${number.replace("+", "")}?text=Hello Developer, i am  ${pushname}`
    }
}
        }, { quoted: mek });
    } catch (error) {
        console.error("Error in owner command:", error);
        reply("❌ An error occurred while sending the VCard.");
    }
});

cmd({
    pattern: "edit",
    desc: "Edit sent messages.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { quoted, q, reply }) => {
    if (!quoted) return reply("⚠️ Reply to a message with `.edit <new text>` to edit it.");
    if (!q) return reply("⚠️ Provide the new text to edit the message.\nExample: `.edit New text`");

    try {
        await conn.sendMessage(m.chat, { text: q, edit: quoted.key });
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});
//--------------------------------------------
//  JID COMMANDS
//--------------------------------------------
cmd({
    pattern: "jid",
    desc: "Get the Bot's JID.",
    category: "owner",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    reply(`🤖 *Bot JID:* ${conn.user.id}`);
});
//--------------------------------------------
//  DONATE COMMANDS
//--------------------------------------------
cmd({
    pattern: "donate",
    desc: "donate to developer",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, quoted }) => {
    try {
        let madeMenu = `
  ------------------------------
  Bank Details:
  ------------------------------
  Bank: Kuda Microfinance Bank
  ------------------------------
  Account Number: 2059497338
  ------------------------------
  Account Name: EFEURHOBO BULLISH
  ------------------------------
`;
        await conn.sendMessage(from, { 
            image: { 
                url: "https://files.catbox.moe/yizr9j.jpg"
            }, 
            caption: madeMenu 
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: `${e}` }, { quoted: mek });
    }
});
//--------------------------------------------
// SET-PP COMMANDS
//--------------------------------------------

//--------------------------------------------
//  SETNAME COMMANDS
//--------------------------------------------
cmd({
    pattern: "setname",
    desc: "Set User name",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { isOwner, q, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!q) return reply("❌ Enter a name!");
    
    try {
        await conn.updateProfileName(q);
        reply(`✅ Username updated to: ${q}`);
    } catch (error) {
        console.error("Error updating username:", error);
        reply(`❌ Error updating username: ${error.message}`);
    }
});
//--------------------------------------------
//  VV COMMANDS
//--------------------------------------------
cmd({
  pattern: "vv",
  desc: "Get view once media (owner/chat).",
  category: "owner",
  react: "👀",
  filename: __filename
}, async (conn, mek, m, { from, q, quoted, args, reply }) => {
  try {
    if (!m.quoted) return reply("```Reply to a View Once message```");

    const qmessage = m.message.extendedTextMessage.contextInfo.quotedMessage;
    const mediaMessage =
      qmessage.imageMessage ||
      qmessage.videoMessage ||
      qmessage.audioMessage;

    if (!mediaMessage?.viewOnce) return reply("```Not a View Once message```");

    const buff = await m.quoted.getbuff;
    const cap = mediaMessage.caption || "";

    // CASE 1: `.vv chat` — send to current chat
    if (args[0]?.toLowerCase() === "chat") {
      if (mediaMessage.mimetype.startsWith("image")) {
        await conn.sendMessage(m.chat, { image: buff, caption: cap });
      } else if (mediaMessage.mimetype.startsWith("video")) {
        await conn.sendMessage(m.chat, { video: buff, caption: cap });
      } else if (mediaMessage.mimetype.startsWith("audio")) {
        await conn.sendMessage(m.chat, {
          audio: buff,
          ptt: mediaMessage.ptt || false,
        });
      } else {
        return reply("```Unsupported Media Message```");
      }

      return;
    }

    // CASE 2: `.vv` — send to owner
    const ownerJid = `${ownerNumber}@s.whatsapp.net`;

    if (mediaMessage.mimetype.startsWith("image")) {
      await conn.sendMessage(ownerJid, { image: buff, caption: cap });
    } else if (mediaMessage.mimetype.startsWith("video")) {
      await conn.sendMessage(ownerJid, { video: buff, caption: cap });
    } else if (mediaMessage.mimetype.startsWith("audio")) {
      await conn.sendMessage(ownerJid, {
        audio: buff,
        ptt: mediaMessage.ptt || false,
      });
    } else {
      return reply("```Unsupported Media Message```");
    }


  } catch (err) {
    console.error(err);
    reply("```" + err.message + "```");
  }
});
//--------------------------------------------
//  SAVE COMMANDS
//--------------------------------------------
cmd({
    pattern: "save",
    desc: "Get status or media message.",
    category: "owner",
    react: "👀",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!quoted) return reply("Please reply to a media message!");

        try {
            const buff = await quoted.getbuff;
            const cap = quoted.msg.caption || '';

            if (quoted.type === 'imageMessage') {
                await conn.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
                    image: buff,
                    caption: cap
                }); 
            } else if (quoted.type === 'videoMessage') {
                await conn.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
                    video: buff,
                    caption: cap
                }); 
            } else if (quoted.type === 'audioMessage') {
                await conn.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
                    audio: buff,
                    ptt: quoted.msg.ptt || false
                }); 
            } else {
                return reply("_*Unknown/Unsupported media*_");
            }
        } catch (error) {
            console.error(error);
            reply(`${error}`);
        }
    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});


cmd({
    pattern: "getpp",
    desc: "Fetch the profile picture of a tagged or replied user.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { quoted, isGroup, sender, participants, reply }) => {
    try {
        // Determine the target user
        const targetJid = quoted ? quoted.sender : sender;

        if (!targetJid) return reply("⚠️ Please reply to a message to fetch the profile picture.");

        // Fetch the user's profile picture URL
        const userPicUrl = await conn.profilePictureUrl(targetJid, "image").catch(() => null);

        if (!userPicUrl) return reply("⚠️ No profile picture found for the specified user.");

        // Send the user's profile picture
        await conn.sendMessage(m.chat, {
            image: { url: userPicUrl },
            caption: "🖼️ Here is the profile picture of the specified user."
        });
    } catch (e) {
        console.error("Error fetching user profile picture:", e);
        reply("❌ An error occurred while fetching the profile picture. Please try again later.");
    }
});

cmd({
    pattern: "pair",
    desc: "Fetch WhatsApp Pairing Code",
    category: "owner",
    react: "📲"
}, async (conn, mek, m, { q, reply, isOwner }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
       if (!q) return reply("use .pair 234807858262xx ");

    try {
        const { data } = await axios.get(`https://session.empiretech.biz.id/code?number=${q}`);
        if (data.code) {
            return reply(`*Your Pairing Code:* ${data.code}`);
        } else {
            return reply(data);
        }
    } catch (e) {
        console.log(e);
        reply(`error: ${e}`);
    }
});

cmd({
    pattern: "qrcode",
    desc: "Fetch QR Code for WhatsApp Session",
    category: "owner"
}, async (conn, mek, m, { from, reply }) => {
    try {
        const url = "https://session.empiretech.biz.id/qr";
        const imageBuffer = await getBuffer(url);
        await conn.sendMessage(from, { image: imageBuffer }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`error: ${e}`);
    }
});
