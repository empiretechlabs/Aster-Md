
const config = require('../config');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process'); 
const path = require("path");

cmd({
    pattern: "setprefix",
    desc: "Change the command prefix",
    category: "misc",
    filename: __filename
}, async (conn, mek, m, { q, isOwner, reply }) => {
    if (!isOwner) return reply('❌ You must be the owner to use this command!');
    if (!q) return reply('_Please provide a new prefix._');

      config.PREFIX = "q";
      saveConfig();
    return reply(`✅ Prefix has been changed to: ${q}`);
});


cmd({
    pattern: "mode",
    desc: "Set Bot Mode",
    category: "misc",
    filename: __filename
}, async (conn, mek, m, { from, q, body, reply, isOwner }) => {
      if (!isOwner) return reply("*Owner Only Command*");

const image = "https://files.catbox.moe/gvg6ww.jpg";

    const infoMess = {
            image: { url: image },
            caption: `> *${global.botname} 𝐌𝐎𝐃𝐄 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*  
Reply With:
*1.* To Enable Public Mode
*2.* To Enable Private Mode
*3.* To Enable Inbox Mode
*4.* To Enable Group Mode
╭────────────────◆  
│ ${global.caption}
╰─────────────────◆`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363337275149306@newsletter',
                    newsletterName: global.botname,
                    serverMessageId: 143
                }
            }
        };

        const messageSent = await conn.sendMessage(from, infoMess, { quoted: mek });
        const messageId = messageSent.key.id;
        conn.ev.on("messages.upsert", async (event) => {
            const messageData = event.messages[0];
            if (!messageData.message) return;
            const messageContent = messageData.message.conversation || messageData.message.extendedTextMessage?.text;
            const isReplyToDownloadPrompt = messageData.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;

            if (isReplyToDownloadPrompt) {
                await m.react("⬇🔄");
                switch (messageContent) {
                    case "1": 
                        config.MODE = "public";
                        saveConfig();
                        return reply("Bot Mode Has Been Set to Public (All Chats).");
                        break;

                    case "2": 
                        config.MODE = "private";
                        saveConfig();
                        return reply("Bot Mode Has Been Set to Private.");
                        break;

                    case "3": 
                        config.MODE = "inbox";
                        saveConfig();
                        return reply("Bot Has Been Set to Work in Inbox(pm) Only.");
                        break;

                    case "4": 
                        config.MODE = "groups";
                        saveConfig();
                        return reply("Bot Has Been Set to work in Groups Only.");
                        break;

                    default:
                  await conn.sendMessage(from, { text: "Invalid option selected. Please reply with a valid number (1 or 2)." });
                }
            }
        }); 
      await m.react("✅");
});
//--------------------------------------------
//            INFO COMMANDS
//--------------------------------------------
cmd({
    pattern: "info",
    desc: "Displays important bot and owner information",
    category: "misc",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isOwner, reply }) => {
    try {
      if (!isOwner) return reply("❏ This command can only be used by the bot owner.");

      const owner = "𝙴𝚖𝚙𝚒𝚛𝚎 𝚃𝚎𝚌𝚑";
      const repoLink = "https://github.com/efeurhobobullish/Empire_Md";

      const uptime = runtime(process.uptime());

      const footer = "𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳";

      const finalMessage = `
╭────「  𝙱𝙾𝚃 𝙸𝙽𝙵𝙾 」────◆  
│ ∘ 𝙾𝚠𝚗𝚎𝚛: ${owner}  
│ ∘ 𝚁𝚎𝚙𝚘𝚜𝚒𝚝𝚘𝚛𝚢: ${repoLink}  
│ ∘ 𝙱𝚘𝚝 𝚄𝚙𝚝𝚒𝚖𝚎: ${uptime}  
╰────────────────────`;

      const imageUrl = "https://files.catbox.moe/z7c67w.jpg";

      await conn.sendMessage(
        from,
        { image: { url: imageUrl }, caption: finalMessage },
        { quoted: mek }
      );

    } catch (e) {
      return reply(`│ ∘ An error occurred while processing your request.\n\n│ ∘ _Error:_ ${e.message}`);
    }
  });
//--------------------------------------------
//            ALIVE COMMANDS
//--------------------------------------------
cmd({
    pattern: "alive",
    desc: "Check if the bot is online.",
    category: "misc",
    filename: __filename
}, async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const uptime = runtime(process.uptime());

        const aliveMsg = `
╭────「  𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳 」────◆  
│ ∘ 𝙷𝙴𝙻𝙻𝙾 ${pushname}  
│────────────────────  
│ ∘ 𝚄𝙿𝚃𝙸𝙼𝙴:  
│ ∘ ${uptime}  
╰────────────────────`;

        await conn.sendMessage(
            from,
            { 
                image: { url: 'https://files.catbox.moe/r4decc.jpg' },
                caption: aliveMsg
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`│ ∘  An error occurred: ${e.message || e}`);
    }
});
//--------------------------------------------
//            PING COMMANDS
//--------------------------------------------
cmd({
  pattern: "ping",
  desc: "To check ping",
  category: "misc",
  filename: __filename,
}, async (conn, mek, m, { from, reply, isCmd, command, args, q, isGroup, pushname }) => {
  const start = Date.now();

  const sentMsg = await conn.sendMessage(from, {
    text: "```Ping!!!```"
  });

  const ping = Date.now() - start;

  await conn.sendMessage(from, {
    text: `*Pong!*\n*${ping} ms*`,
    edit: sentMsg.key
  });
});

//--------------------------------------------
//            REPO COMMANDS
//--------------------------------------------
 cmd({
        pattern: "repo",
        alias: ["git", "sc", "script"],
        desc: "Sends info about repo.",
        category: "misc",
        filename: __filename
    },
    async (conn, mek, m, { pushname, reply }) => {
        try {
            let { data } = await axios.get('https://api.github.com/repos/efeurhobobullish/Empire_Md');
            let cap = `Hey ${pushname}\n
*⭐ Total Stars:* ${data.stargazers_count} stars
*🍽️ Forks:* ${data.forks_count} forks
*🍁 Repo:* https://github.com/efeurhobobullish/Empire_Md
*Group:* https://tinyurl.com/EMPIRE-MD-GROUP
*Deploy Your Own:*-
https://session.empiretech.biz.id`;

            let buttonMessage = {
                image: { url: "https://files.catbox.moe/6ntq2i.jpg" }, // ✅ Updated Image URL
                caption: cap,
                footer: global.caption,
                headerType: 4,
                contextInfo: {
                    externalAdReply: {
                        title: "Empire_Md Repo",
                        body: "Easy to Use",
                        thumbnailUrl: "https://files.catbox.moe/6ntq2i.jpg", // ✅ Updated Thumbnail
                        mediaType: 4,
                        mediaUrl: 'https://github.com/efeurhobobullish/Empire_Md',
                        sourceUrl: 'https://github.com/efeurhobobullish/Empire_Md',
                    },
                },
            };

            await conn.sendMessage(m.chat, buttonMessage, { quoted: mek });
        } catch (e) {
            console.error('❌ Repo Command Error:', e);
            return reply("❌ Failed to fetch repo details.");
        }
    }
);
//--------------------------------------------
//            REPORT COMMANDS
//--------------------------------------------
cmd({
    pattern: "requestbug",
    alias: ["report"],
    category: "misc",
    react: "🤕",
    desc: "Allows users to report a bug with a description.",
    filename: __filename,
}, async (conn, mek, m, { from, body, sender, pushname }) => {
    try {
        const bugDescription = body.split(" ").slice(1).join(" ");

        if (!bugDescription) {
            return await conn.sendMessage(from, { text: "❏ Example: .requestbug This command is not working." }, { quoted: mek });
        }

        const devsNumber = global.devs;

        const requestMessage = `
╭────「 𝙱𝚄𝙶 𝚁𝙴𝙿𝙾𝚁𝚃 」────◆  
│ ∘ 𝙵𝚛𝚘𝚖: @${sender.split('@')[0]}  
│ ∘ 𝙽𝚊𝚖𝚎: ${pushname || "Unknown"}  
│───────────────────────  
│ ∘ 𝚁𝚎𝚙𝚘𝚛𝚝:  
│ ∘  ${bugDescription}  
╰────────────────────
        `;

        await conn.sendMessage(`${devsNumber}@s.whatsapp.net`, { text: requestMessage });
        await conn.sendMessage(from, { text: "❏ Your bug report has been sent to the developers." }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: "❏ An error occurred while submitting your bug report. Please try again later." }, { quoted: mek });
    }
});
//--------------------------------------------
//            UPTIME COMMANDS
//--------------------------------------------
cmd({
    pattern: "uptime",
    desc: "Check bot's uptime.",
    category: "misc",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        
        function formatUptime(seconds) {
            const days = Math.floor(seconds / (24 * 60 * 60));
            seconds %= 24 * 60 * 60;
            const hours = Math.floor(seconds / (60 * 60));
            seconds %= 60 * 60;
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        const uptime = formatUptime(process.uptime());
        const uptimeMessage = `${monospace(uptime)}`;
        await conn.sendMessage(from, { text: uptimeMessage }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`An error occurred: ${e.message || e}`);
    }
});


cmd({
    pattern: "restart",
    desc: "Restart the bot",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        reply("Restarting...");
        await sleep(1500);
        exec("pm2 restart all");
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});