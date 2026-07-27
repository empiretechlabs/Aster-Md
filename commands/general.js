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
const config = require('../config');
const fs = require('fs');
const theme = require('../Themes/Empire_Md.json');
const t = theme.STRINGS.global;
const os = require('os');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const ownerNumber = [config.OWNER_NUMBER];
const mode = config.MODE;
const prefix = config.PREFIX;
const timeZone = config.TIME_ZONE;
const botname = t.botName;
const version = "2.0.0";
//--------------------------------------------


cmd({
  pattern: "menu",
  desc: "Get command list",
  category: "general",
  filename: __filename
}, async (conn, mek, m, { from, quoted, sender, pushname, reply }) => {
  try {
    // Time and Date
     function formatUptime(seconds) {
            const days = Math.floor(seconds / (24 * 60 * 60));
            seconds %= 24 * 60 * 60;
            const hours = Math.floor(seconds / (60 * 60));
            seconds %= 60 * 60;
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    const now = new Date();
    const options = { timeZone, hour12: true };
    const time = now.toLocaleTimeString('en-US', options);
    const date = now.toLocaleDateString('en-US', options);
    const dayOfWeek = now.toLocaleDateString('en-US', { timeZone, weekday: 'long' });

    // System Info
    const uptime = formatUptime(process.uptime());
    const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    const memoryUsage = `${usedMemory}GB / ${totalMemory}GB`;
    const totalCommands = commands.length;

    // Categorize commands dynamically
    const categorized = commands.reduce((menu, cmd) => {
      if (cmd.pattern && !cmd.dontAddCommandList) {
        if (!menu[cmd.category]) menu[cmd.category] = [];
        menu[cmd.category].push(cmd.pattern);
      }
      return menu;
    }, {});

    // Header
      const header = `\`\`\`
╭────〔 ${botname} 〕────╮
│ ╭─────╼❖╾─────╮
│ │ Date  : ${date}
│ │ Day   : ${dayOfWeek}
│ │ Mem   : ${memoryUsage}
│ │ Mode  : ${mode}
│ │ Owner : ${pushname}
│ │ Plugins: ${totalCommands.toString()}
│ │ Prefix: [${prefix}]
│ │ Time  : ${time}
│ │ Uptime : ${uptime}
│ │ Version : ${version}
│ ╰─────╼❖╾─────╯
╰══════════════════╯
\`\`\`\n`;

const formatCategory = (category, cmds) => {  
  const title = `┌───〈 *${category.toLowerCase()}*  〉───`;  
  const body = cmds.map(cmd => `│ ${prefix}${cmd}`).join('\n');  
  const footer = `└────────────\n`;  
  return `${title}\n${body}\n${footer}`;  
};

    // Generate menu
    let menu = header;
    for (const [category, cmds] of Object.entries(categorized)) {
      menu += formatCategory(category, cmds) + '\n';
    }

      await conn.sendMessage(
  from,
  {
    image: fs.readFileSync('./lib/assets/empire.jpg'),
    caption: menu,
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
  },
  { quoted: null }
);
  } catch (e) {
    console.log(e);
    reply(`${e}`);
  }
});


cmd({
    pattern: "list",
    desc: "Show all commands and descriptions",
    react: "📜",
    category: "general",
    filename: __filename
},
async (conn, mek, m, { from, quoted, isCmd, command, args, q, isGroup, sender, pushname, reply }) => {
    try {
        // Format uptime function
          const now = new Date();
        const options = { timeZone, hour12: true };
        const time = now.toLocaleTimeString('en-US', options);
        const date = now.toLocaleDateString('en-US', options);
        const dayOfWeek = now.toLocaleDateString('en-US', { timeZone, weekday: 'long' });

        const uptime = runtime(process.uptime()); 
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
       const memoryUsage = `${usedMemory}GB / ${totalMemory}GB`;
        const totalCommands = commands.length;
        // Format the command list
        let list = `╭━━〘 ᴇᴍᴘɪʀᴇ-ᴍᴅ 〙────⊷  
┃ ✭ ᴘʀᴇꜰɪx: ${prefix}  
┃ ✭ ᴏᴡɴᴇʀ: ${pushname}  
┃ ✭ ᴄᴏᴍᴍᴀɴᴅꜱ: ${totalCommands.toString()}  
┃ ✭ ᴜᴘᴛɪᴍᴇ: ${uptime}  
┃ ✭ ᴅᴀᴛᴇ: ${date}  
┃ ✭ ᴛɪᴍᴇ: ${time}  
╰━━━━━━━━━━━━━━⊷\n`;

        commands.forEach((cmd, index) => {
            if (cmd.pattern && cmd.desc) {
                list += `*${index + 1} ${monospace(cmd.pattern)}*\n  ${cmd.desc}\n`;
            }
        });

        await conn.sendMessage(from, {
            text: list.trim(),
        }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});


cmd({
  pattern: "menus",
  desc: "Display bot's uptime, date, time, and other stats",
  category: "general",
  filename: __filename
},
async (conn, mek, m, { from, quoted, sender, pushname, reply }) => {
  try {
    const now = new Date();

    const options = { timeZone, hour12: true };
    const time = now.toLocaleTimeString('en-US', options);
    const date = now.toLocaleDateString('en-US', options);
    const dayOfWeek = now.toLocaleDateString('en-US', { timeZone, weekday: 'long' });

    const uptime = runtime(process.uptime());

    const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    const memoryUsage = `${usedMemory}GB / ${totalMemory}GB`;

    const infoMessage = `╭───❰ *📊 System Info* ❱
│🦄 ᴜᴘᴛɪᴍᴇ : ${uptime}
│📆 ᴅᴀᴛᴇ : ${date}
│⏰ ᴛɪᴍᴇ : ${time}
│📅 ᴅᴀʏ : ${dayOfWeek}
│💾 ᴍᴇᴍᴏʀʏ : ${memoryUsage}
╰─────────────⦁

👤 *ᴜsᴇʀ:* ${pushname}
🧑‍💼 *ᴏᴡɴᴇʀ:* Empire Tech
📞 *ɴᴜᴍ:* ${config.OWNER_NUMBER}

🧑‍💻 ᴇᴍᴘɪʀᴇ-ᴍᴅ ɪꜱ ɴᴏᴡ ᴀᴠᴀɪʟᴀʙʟᴇ ✅

╭──❰ *📜 ᴀʟʟ ᴍᴇɴᴜ* ❱
│🏮 list
│🏮 category
│🏮 help
│🏮 alive
│🏮 uptime
│🏮 weather
│🏮 link
│🏮 cpu
│🏮 repository
╰─────────────⦁
`;

    await conn.sendMessage(from, { text: infoMessage }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message || e}`);
  }
});


cmd({
    pattern: "file",
    desc: "Get the exact file name where a command is located in the repo.",
    category: "general",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("Provide a command name to check its file location!");

    const cmdData = commands.find((cmd) => cmd.pattern === q.toLowerCase());
    if (!cmdData) return reply("*❌ No such command found.*");

    let response = `*🍁 Command:* ${cmdData.pattern}`;
    response += `\n*🧩 Type:* ${cmdData.category || "misc"}`;
    response += `\n✨ *File Name:* ${cmdData.filename || "Not Provided"}`;

    reply(response);
});
