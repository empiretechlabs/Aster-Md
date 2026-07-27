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
const prefix = config.PREFIX;
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { writeFileSync } = require('fs');
const fs = require('fs');
const axios = require("axios");
const path = require('path');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
 

cmd({
  pattern: "react",
  desc: "Send emoji reaction to a channel message",
  category: "group",
  filename: __filename
}, async (conn, mek, m, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender,
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner,
  groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    if (!q) {
      return reply("Example usage:\n.react https://whatsapp.com/channel/0029VaG9VfPKWEKk1rxTQD20/18383 hello");
    }

    if (!q.startsWith("https://whatsapp.com/channel/")) {
      return reply("❌ Invalid link! Must be a WhatsApp channel message URL.");
    }

    const xeonReaction = {
      a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
      h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
      o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
      v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
      '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
      '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
    };

    const link = args[0];
    const emojiText = args.slice(1).join(' ').toLowerCase();

    if (!emojiText) {
      return reply("❌ You must specify the emoji text to react with.");
    }

    const emoji = emojiText.split('').map(char => {
      if (char === ' ') return '―';
      return xeonReaction[char] || char;
    }).join('');

    const channelId = link.split('/')[4];
    const messageId = link.split('/')[5];

    const channel = await conn.newsletterMetadata("invite", channelId);
    await conn.newsletterReactMessage(channel.id, messageId, emoji);

    return reply(`✅ Reaction *${emoji}* sent to message in channel *${channel.name}*.`);
  } catch (err) {
    console.error("React Error:", err);
    return reply(`❌ Error: ${err.message}`);
  }
});

// Set Welcome
cmd({
  pattern: "setwelcome",
  desc: "Set a custom welcome message",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, q, reply }) => {

  if (!isGroup) return reply("❌ This command can only be used in groups!")
  if (!isAdmins && !isOwner) return reply("❌ Only group admins can use this command!")
  if (!q) return reply("❌ Provide a welcome message!\nExample:\n.setwelcome Welcome @user to @gname")

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { welcome: q },
      { upsert: true, new: true }
    )

    reply("✅ Welcome message updated successfully!")
  } catch (e) {
    console.error(e)
    reply("❌ Failed to update welcome message.")
  }
});


cmd({
  pattern: "setgoodbye",
  desc: "Set a custom goodbye message",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, q, reply }) => {

  if (!isGroup) return reply("❌ This command can only be used in groups!")
  if (!isAdmins && !isOwner) return reply("❌ Only group admins can use this command!")
  if (!q) return reply("❌ Provide a goodbye message!\nExample:\n.setgoodbye Goodbye @user")

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { goodbye: q },
      { upsert: true, new: true }
    )

    reply("✅ Goodbye message updated successfully!")
  } catch (e) {
    console.error(e)
    reply("❌ Failed to update goodbye message.")
  }
});

cmd({
  pattern: "welcome",
  desc: "Enable or disable welcome messages",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {

  if (!isGroup) return reply("❌ This command can only be used in groups!");
  if (!isAdmins && !isOwner) return reply("❌ Only group admins can use this command!");
  if (!args[0] || !["on","off"].includes(args[0].toLowerCase()))
    return reply("❌ Use: .welcome on / .welcome off");

  const status = args[0].toLowerCase() === "on" ? "true" : "false";

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { events: status },
      { upsert: true, new: true }
    );

    reply(`✅ Welcome messages ${status === "true" ? "enabled" : "disabled"}!`);
  } catch (e) {
    console.error(e);
    reply("❌ Failed to update welcome toggle.");
  }

});

cmd({
  pattern: "goodbye",
  desc: "Enable or disable goodbye messages",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {

  if (!isGroup) return reply("❌ This command can only be used in groups!");
  if (!isAdmins && !isOwner) return reply("❌ Only group admins can use this command!");
  if (!args[0] || !["on","off"].includes(args[0].toLowerCase()))
    return reply("❌ Use: .goodbye on / .goodbye off");

  const status = args[0].toLowerCase() === "on" ? "true" : "false";

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { events: status },
      { upsert: true, new: true }
    );

    reply(`✅ Goodbye messages ${status === "true" ? "enabled" : "disabled"}!`);
  } catch (e) {
    console.error(e);
    reply("❌ Failed to update goodbye toggle.");
  }

});

cmd({
  pattern: "antifake",
  desc: "Enable or disable antifake system in group.",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isAdmins, reply }) => {

  if (!isGroup) return reply("This command works only in groups.");
  if (!isAdmins) return reply("Admins only.");

  const type = (args[0] || "").toLowerCase();

  if (!["on", "off"].includes(type)) {
    return reply("Usage: .antifake on / off");
  }

  const status = type === "on" ? "true" : "false";

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { antifake: status },
      { upsert: true, new: true }
    );

    return reply(`AntiFake system ${status === "true" ? "enabled" : "disabled"} for this group.`);
  } catch (err) {
    console.error(err);
    return reply("Failed to update antifake.");
  }

});

cmd({
  pattern: "antilink",
  desc: "Enable or disable anti-link in a group",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, q, isGroup, isAdmins, reply }) => {

  if (!isGroup) return reply(t.group);
  if (!isAdmins) return reply(t.admin);

  const mode = (q || "").toLowerCase();

  if (!["kick", "delete", "warn", "off"].includes(mode)) {
    return reply("Usage: .antilink kick/delete/warn/off");
  }

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { antilink: mode },
      { upsert: true, new: true }
    );

    return reply(`Antilink mode set to: ${mode}`);
  } catch (e) {
    console.error(e);
    return reply("Failed to update antilink.");
  }

});

cmd({
  pattern: "antitag",
  desc: "Enable or disable anti-tag in a group",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, q, isGroup, isAdmins, reply }) => {

  if (!isGroup) return reply("This command works only in groups.");
  if (!isAdmins) return reply("Admins only.");

  const mode = (q || "").toLowerCase();

  if (!["kick", "delete", "warn", "off"].includes(mode)) {
    return reply("Usage: .antitag kick/delete/warn/off");
  }

  try {
    await sck.findOneAndUpdate(
      { id: from },
      { antitag: mode },
      { upsert: true, new: true }
    );

    return reply(`Antitag mode set to: ${mode}`);
  } catch (e) {
    console.error(e);
    return reply("Failed to update antitag.");
  }

});
     
cmd({
pattern: "vcf",
  desc: "Export all group members' contacts as a VCF file.",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, sender, groupAdmins, groupName, participants, pushName, groupMetadata }) => {
   if (!isGroup) return reply(t.group);
  if (!isAdmins) return reply(t.admin);

 let vcfContent = "";

  for (const p of participants) {
    const jid = p.id;
    const number = jid.split("@")[0];
    let name;

try {
  name = await conn.getName(p.id);
} catch (e) {
  name = p.id.split("@")[0];
}
    const org = groupName || "WhatsApp Group";

    const vcard =
      `BEGIN:VCARD\n` +
      `VERSION:3.0\n` +
      `FN:${name}\n` +
      `ORG:${org};\n` +
      `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
      `END:VCARD\n`;

    vcfContent += vcard;
  }

  const tmpDir = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const fileNameSafe = groupName.replace(/[^a-zA-Z0-9]/g, "");
  const filePath = path.join(tmpDir, `${fileNameSafe}_contacts.vcf`);
  fs.writeFileSync(filePath, vcfContent);

  await conn.sendMessage(m.chat, {
    document: fs.readFileSync(filePath),
    fileName: `${fileNameSafe}_contacts.vcf`,
    mimetype: 'text/x-vcard'
  }, { quoted: null });

  fs.unlinkSync(filePath);
});


cmd({
  pattern: "broadcast",
  category: "group",
  desc: "Bot makes a broadcast in all groups",
  filename: __filename,
  use: "<text for broadcast.>"
}, async (conn, mek, m, { q, isGroup, isAdmins, reply }) => {
  try {
    if (!isGroup) return reply(t.group);
    if (!isAdmins) return reply(t.admin);
    if (!q) return reply("❌ Provide text to broadcast in all groups!");

    let allGroups = await conn.groupFetchAllParticipating();
    let groupIds = Object.keys(allGroups);

    reply(`📢 Sending Broadcast To ${groupIds.length} Groups...\n⏳ Estimated Time: ${groupIds.length * 1.5} seconds`);

    for (let groupId of groupIds) {
      try {
        await sleep(1500); // Avoid rate limits
        await conn.sendMessage(groupId, { text: q }); // Sends only the provided text
      } catch (err) {
        console.log(`❌ Failed to send broadcast to ${groupId}:`, err);
      }
    }

    return reply(t.success);
    
  } catch (err) {
    await m.error(`❌ Error: ${err}\n\nCommand: broadcast`, err);
  }
});

cmd({
    pattern: "getgpp",
    desc: "Fetch the profile picture of the current group chat.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, reply }) => {
      if (!isGroup) return reply(t.group);
    try {
        // Fetch the group profile picture URL
        const groupPicUrl = await conn.profilePictureUrl(m.chat, "image").catch(() => null);

        if (!groupPicUrl) return reply("⚠️ No profile picture found for this group.");

        // Send the group profile picture
        await conn.sendMessage(m.chat, {
            image: { url: groupPicUrl },
            caption: "🖼️ Here is the profile picture of this group chat."
        });
       } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "delete",
    alias: "dlt",
    desc: "Delete a quoted message.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, quoted, isOwner, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply(t.owner);
        if (!quoted) return reply("❌ Please reply to the message you want to delete.");
        
        const key = {
            remoteJid: from,
            fromMe: quoted.fromMe,
            id: quoted.id,
            participant: quoted.sender,
        };

        await conn.sendMessage(from, { delete: key });
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


cmd({
    pattern: "invite",
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, isBotAdmins, isAdmins, reply }) => {
    try {
        // Ensure this is being used in a group
        if (!isGroup) return reply(t.group);

        // Get the sender's number
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        
        // Check if the bot is an admin
        const groupMetadata = isGroup ? await conn.groupMetadata(from) : '';
        const groupAdmins = groupMetadata ? groupMetadata.participants.filter(member => member.admin) : [];
        
         if (!isBotAdmins) return reply(t.botAdmin);
         if (!isAdmins) return reply(t.admin);

        // Get the invite code and generate the link
        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) return reply("Failed to retrieve the invite code.");

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // Reply with the invite link
        return reply(`*Here is your group invite link:*\n${inviteLink}`);
        
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "tag",
    category: "group",
    desc: "Tags every person in the group without showing the sender's name.",
    filename: __filename,
}, async (conn, mek, m, { 
    from, 
    quoted, 
    body, 
    isCmd, 
    command, 
    args, 
    q, 
    isGroup, 
    sender, 
    isOwner,
    senderNumber, 
    botNumber, 
    pushname, 
    groupMetadata, 
    participants, 
    groupAdmins, 
    isBotAdmins, 
    isAdmins, 
    reply
}) => {
    try {
        if (!isGroup) return reply(t.group);
        
          const metadata = await conn.groupMetadata(from);
        const mentions = metadata.participants.map(p => p.id);

        const quoted = m.quoted;
        const qmsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // If user provided text only
        if (q && !quoted) {
            return await conn.sendMessage(from, {
                text: q,
                mentions
            });
        }

        // If quoted text
        if (qmsg?.conversation || qmsg?.extendedTextMessage?.text) {
            const text = qmsg.conversation || qmsg.extendedTextMessage?.text;
            return await conn.sendMessage(from, {
                text,
                mentions
            });
        }

        // If quoted sticker
        if (quoted?.type === 'stickerMessage') {
            const stickerBuffer = await quoted.download();
            return conn.sendMessage(from, { sticker: stickerBuffer, mentions });
        }

        // If quoted image
        if (quoted?.type === 'imageMessage') {
            const imageBuffer = await quoted.download();
            const caption = quoted.msg?.caption || "";
            return conn.sendMessage(from, {
                image: imageBuffer,
                caption,
                mentions
            });
        }

        // If quoted video
        if (quoted?.type === 'videoMessage') {
            const videoBuffer = await quoted.download();
            const caption = quoted.msg?.caption || "";
            return conn.sendMessage(from, {
                video: videoBuffer,
                caption,
                mentions
            });
        }

        // If quoted audio
        if (quoted?.type === 'audioMessage') {
            const audioBuffer = await quoted.download();
            return conn.sendMessage(from, {
                audio: audioBuffer,
                ptt: quoted.msg?.ptt || false,
                mentions
            });
        }

        // If no valid content
        return reply("❌ No valid text or media found.");

   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
  pattern: "exit",
  desc: "Leaves the current group",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // `from` is the group chat ID
       return reply(t.wait);
    await conn.groupLeave(from);
       return reply(t.success);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//   KICK COMMANDS
//--------------------------------------------
cmd({
  pattern: "kick",
  desc: "Kicks replied/quoted user from group.",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { 
  from, quoted, args, isGroup, isBotAdmins, isAdmins, reply 
}) => {
    if (!isGroup) return reply(t.group);
    if (!isAdmins) return reply(t.admin);
  try {
    let users = quoted 
      ? quoted.sender 
      : args[0] 
        ? args[0].includes("@") 
          ? args[0].replace(/[@]/g, "") + "@s.whatsapp.net" 
          : args[0] + "@s.whatsapp.net" 
        : null;

    if (!users) {
      return reply("Please reply to a message or provide a valid number.");
    }
    await conn.groupParticipantsUpdate(from, [users], "remove");
    return reply(t.success);
     } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

//--------------------------------------------
//    Kickall COMMANDS
//--------------------------------------------

cmd({
  pattern: "kickall",
  desc: "Kicks all members from the group except the bot and the command sender.",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { 
  from, isGroup, isBotAdmins, isAdmins, reply, groupMetadata, sender, botNumber 
}) => {
    if (!isGroup) return reply(t.group);
    if (!isAdmins) return reply(t.admin);

    try {
        const participants = groupMetadata.participants;

        // Exclude the bot and the admin who ran the command
        const users = participants
          .map(p => p.id)
          .filter(id => id !== botNumber && id !== sender);

        if (!users.length) {
          return reply("No users available to remove.");
        }

        await conn.groupParticipantsUpdate(from, users, "remove");

        return reply("✅ All members have been removed except you and the bot.");
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || e}`);
    }
});
//--------------------------------------------
//    ADD COMMANDS
//--------------------------------------------
cmd({
    pattern: "add",
    desc: "Adds a user to the group.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, isGroup, participants, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(t.group);
        if (!isAdmins) return reply(t.admin);
        let userToAdd;

        // Reply-based add
        if (quoted && quoted.sender) {
            userToAdd = quoted.sender;
        }

        // Argument-based add (e.g., .add 234xxx)
        else if (q && !isNaN(q)) {
            userToAdd = `${q}@s.whatsapp.net`;
        } else {
            return reply("Reply to a user's message or provide a valid phone number.");
        }

        if (participants.some(p => p.id === userToAdd)) {
            return reply("The user is already in the group.");
        }

        await conn.groupParticipantsUpdate(from, [userToAdd], "add");
        return reply(t.success);
        
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


cmd({
  pattern: "warn",
  desc: "Warn a user in group or private chat",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, {
  from, quoted, q, isGroup, isAdmins, isOwner, sender, reply
}) => {

  if (!quoted) return reply("❌ Reply to the user's message to warn them.");
  if (!isOwner && !isAdmins) return reply("❌ Only admins or owner can issue warnings.");

  const target = quoted?.sender || quoted?.participant || quoted?.key?.participant;
  if (!target) return reply("❌ Could not determine the target user.");

  const chatType = isGroup ? from : "private";
  const reason = q || "No reason provided";

  // Create new warning document
  await warndb.create({
    id: target,
    group: chatType,
    reason,
    warnedby: sender,
    date: Date.now()
  });

  // Count total warnings
  const warnCount = await warndb.countDocuments({
    id: target,
    group: chatType
  });

  if (warnCount >= 3) {

    if (isGroup) {
      await conn.groupParticipantsUpdate(from, [target], "remove");
    } else {
      await conn.updateBlockStatus(target, "block");
    }

    await warndb.deleteMany({ id: target, group: chatType });

    return reply(`❌ @${target.split("@")[0]} has been removed/blocked after 3 warnings.`);
  }

  return reply(
    `⚠️ Warned @${target.split("@")[0]}.\nReason: ${reason}\nWarnings: ${warnCount}/3`
  );
});

cmd({
  pattern: "checkwarn",
  desc: "Check a user's warnings",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { quoted, isGroup, from, reply }) => {

  if (!quoted) return reply("❌ Reply to the user's message to check warnings.");

  const target = quoted?.sender || quoted?.participant || quoted?.key?.participant;
  if (!target) return reply("❌ Could not determine the target user.");

  const chatType = isGroup ? from : "private";

  const warnCount = await warndb.countDocuments({
    id: target,
    group: chatType
  });

  if (warnCount === 0)
    return reply(`✅ @${target.split("@")[0]} has 0 warnings.`);

  const latestWarn = await warndb.findOne({
    id: target,
    group: chatType
  }).sort({ date: -1 });

  return reply(
    `⚠️ @${target.split("@")[0]} has ${warnCount} warnings.\nLast Reason: ${latestWarn?.reason || "No reason"}`
  );
});


cmd({
  pattern: "rwarn",
  desc: "Reset a user's warnings",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { quoted, isGroup, isAdmins, isOwner, from, reply }) => {

  if (!quoted) return reply("❌ Reply to the user's message to reset warnings.");
  if (!isOwner && !isAdmins) return reply("❌ Only admins or owner can reset warnings.");

  const target = quoted?.sender || quoted?.participant || quoted?.key?.participant;
  if (!target) return reply("❌ Could not determine the target user.");

  const chatType = isGroup ? from : "private";

  const existing = await warndb.countDocuments({
    id: target,
    group: chatType
  });

  if (existing === 0)
    return reply(`✅ @${target.split("@")[0]} has no warnings.`);

  await warndb.deleteMany({
    id: target,
    group: chatType
  });

  return reply(`✅ Reset warnings for @${target.split("@")[0]}.`);
});

cmd({
  pattern: "poll",
  category: "group",
  desc: "Create a poll with a question and options in the group.",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, prefix, pushname, reply }) => {
  try {
    let [question, optionsString] = body.split(";");
    
    if (!question || !optionsString) {
      return reply(`Usage: ${prefix}poll question;option1,option2,option3...`);
    }

    let options = [];
    for (let option of optionsString.split(",")) {
      if (option && option.trim() !== "") {
        options.push(option.trim());
      }
    }

    if (options.length < 2) {
      return reply("*Please provide at least two options for the poll.*");
    }

    await conn.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
        toAnnouncementGroup: true,
      }
    }, { quoted: mek });
     } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "ship",
    desc: "Randomly ship two members in a group.",
    category: "group",
    react: "💞",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups!");
        
        const members = participants.filter(p => !p.admin); // Exclude admins if needed
        if (members.length < 2) return reply("❌ Not enough members to ship!");

        const shuffled = members.sort(() => Math.random() - 0.5);
        const user1 = shuffled[0].id;
        const user2 = shuffled[1].id;

        reply(`💖 I randomly ship @${user1.split("@")[0]} & @${user2.split("@")[0]}! Cute couple! 💞`, {
            mentions: [user1, user2]
        });

       } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//  NEW_GC COMMANDS
//--------------------------------------------
cmd({
  pattern: "newgc",
  category: "group",
  desc: "Create a new group and add participants.",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, reply }) => {
  try {
    if (!body) {
      return reply(`Usage: !newgc group_name;number1,number2,...`);
    }

    const [groupName, numbersString] = body.split(";");
    
    if (!groupName || !numbersString) {
      return reply(`Usage: !newgc group_name;number1,number2,...`);
    }

    const participantNumbers = numbersString.split(",").map(number => `${number.trim()}@s.whatsapp.net`);

    const group = await conn.groupCreate(groupName, participantNumbers);
    console.log('created group with id: ' + group.id); // Use group.id here

    const inviteLink = await conn.groupInviteCode(group.id); // Use group.id to get the invite link

    await conn.sendMessage(group.id, { text: 'hello there' });

    reply(`Group created successfully with invite link: https://chat.whatsapp.com/${inviteLink}\nWelcome message sent.`);
  } catch (e) {
    return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
  }
});

cmd({
    pattern: "join",                // Command pattern
    desc: "Joins a group by link",  // Command description
    category: "group",              // Already group
    filename: __filename     // Current file reference
}, async (conn, mek, m, { from, quoted, body, args, q, isOwner, reply }) => {
    try {
        // Check if the command is being used by the owner
        if (!isOwner) return reply("𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐈𝐬 𝐎𝐧𝐥𝐲 𝐅𝐨𝐫 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 ⚠️");

        // Check if the URL is provided
        if (!args[0]) return reply("Please provide a valid WhatsApp group link.");

        // Validate if the link contains "whatsapp.com"
        const groupLink = args[0];
        if (!groupLink.includes("whatsapp.com")) {
            return reply("Invalid link. Please provide a valid WhatsApp group link.");
        }

        // Extract the invite code from the link
        const inviteCode = groupLink.split("https://chat.whatsapp.com/")[1];
        if (!inviteCode) {
            return reply("Invalid link format. Make sure it's a full WhatsApp invite link.");
        }

        // Attempt to join the group using the extracted invite code
        await conn.groupAcceptInvite(inviteCode)
            .then(() => reply("𝐃𝐨𝐧𝐞 ✓"))
            .catch((err) => {
                console.error("Error joining group:", err);
                reply("❌ Failed to join the group. Please ensure the link is correct or the group is open to invites.");
            });

    } catch (e) {
        console.error("Error in join command:", e);
        reply("An unexpected error occurred while trying to join the group.");
    }
});

cmd({
    pattern: "mute",
    alias: ["silence"],
    desc: "Mute all group members.",
    category: "group", // Already group
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, reply }) => {
    try {
        // Ensure this is being used in a group
        if (!isGroup) return reply("𝐓𝐡𝐢𝐬 𝐅𝐞𝐚𝐭𝐮𝐫𝐞 𝐈𝐬 𝐎𝐧𝐥𝐲 𝐅𝐨𝐫 𝐆𝐫𝐨𝐮𝐩❗");

        // Get the sender's number
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];

        // Check if the bot is an admin
        const groupMetadata = isGroup ? await conn.groupMetadata(from) : '';
        const groupAdmins = groupMetadata ? groupMetadata.participants.filter(member => member.admin) : [];
        const isBotAdmins = isGroup ? groupAdmins.some(admin => admin.id === botNumber + '@s.whatsapp.net') : false;

        if (!isBotAdmins) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐌𝐞 𝐀𝐝𝐦𝐢𝐧 𝐑𝐨𝐥𝐞 ❗");

        // Check if the sender is an admin
        const isAdmins = isGroup ? groupAdmins.some(admin => admin.id === sender) : false;
        if (!isAdmins) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐌𝐞 𝐀𝐝𝐦𝐢𝐧 𝐑𝐨𝐥𝐞 ❗");

        // Mute all participants
        await conn.groupSettingUpdate(from, 'announcement');  // This mutes the group (only admins can send messages)

        // Send confirmation reply
        return reply("All members have been muted successfully.");

    } catch (error) {
        console.error("Error in mute command:", error);
        reply(`An error occurred: ${error.message || "Unknown error"}`);
    }
});
//--------------------------------------------
//   UNMUTE COMMANDS
//--------------------------------------------
cmd({
    pattern: "unmute",
    alias: ["unsilence"],
    desc: "Unmute all group members.",
    category: "group", // Already group
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, reply }) => {
    try {
        // Ensure this is being used in a group
        if (!isGroup) return reply("𝐓𝐡𝐢𝐬 𝐅𝐞𝐚𝐭𝐮𝐫𝐞 𝐈𝐬 𝐎𝐧𝐥𝐲 𝐅𝐨𝐫 𝐆𝐫𝐨𝐮𝐩❗");

        // Get the sender's number
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];

        // Check if the bot is an admin
        const groupMetadata = isGroup ? await conn.groupMetadata(from) : '';
        const groupAdmins = groupMetadata ? groupMetadata.participants.filter(member => member.admin) : [];
        const isBotAdmins = isGroup ? groupAdmins.some(admin => admin.id === botNumber + '@s.whatsapp.net') : false;

        if (!isBotAdmins) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐌𝐞 𝐀𝐝𝐦𝐢𝐧 𝐑𝐨𝐥𝐞 ❗");

        // Check if the sender is an admin
        const isAdmins = isGroup ? groupAdmins.some(admin => admin.id === sender) : false;
        if (!isAdmins) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐌𝐞 𝐀𝐝𝐦𝐢𝐧 𝐑𝐨𝐥𝐞 ❗");

        // Unmute all participants
        await conn.groupSettingUpdate(from, 'not_announcement');  // This unmutes the group (everyone can send messages)

        // Send confirmation reply
        return reply("All members have been unmuted successfully.");

    } catch (error) {
        console.error("Error in unmute command:", error);
        reply(`An error occurred: ${error.message || "Unknown error"}`);
    }
});
//--------------------------------------------
//  PROMOTE COMMANDS
//--------------------------------------------
cmd({
  pattern: "promote",
  desc: "Provides admin role to replied/quoted user",
  category: "group",
  filename: __filename,
  use: "<quote|reply|number>"
}, async (conn, mek, m, { 
  from, quoted, args, isGroup, isOwner, sender, botNumber, groupAdmins, isBotAdmins, isAdmins, reply 
}) => {
     if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);

  try {
    let users = quoted 
      ? quoted.sender 
      : args[0] 
        ? args[0].includes("@") 
          ? args[0].replace(/[@]/g, "") + "@s.whatsapp.net" 
          : args[0] + "@s.whatsapp.net" 
        : null;

    if (!users) {
      return reply("Please reply to a message or provide a valid number.");
    }

    await conn.groupParticipantsUpdate(from, [users], "promote");
    reply("User has been promoted to admin successfully.");
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//  DEMOTE COMMANDS
//--------------------------------------------
cmd({
  pattern: "demote",
  desc: "Demotes replied/quoted user from admin role in the group.",
  category: "group",
  filename: __filename,
  use: "<quote|reply|number>"
}, async (conn, mek, m, { 
  from, quoted, args, isGroup, sender, isOwner, botNumber, groupAdmins, isBotAdmins, isAdmins, reply 
}) => {

     if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);

  try {
    let users = quoted 
      ? quoted.sender 
      : args[0] 
        ? args[0].includes("@") 
          ? args[0].replace(/[@]/g, "") + "@s.whatsapp.net" 
          : args[0] + "@s.whatsapp.net" 
        : null;

    if (!users) {
      return reply("Please reply to a message or provide a valid number.");
    }

    await conn.groupParticipantsUpdate(from, [users], "demote");
    reply("User has been demoted from admin successfully.");
     } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//  TAG_ALL COMMANDS
//--------------------------------------------
cmd({
    pattern: "tagall",
    category: "group",
    desc: "Tags every person in the group.",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, groupMetadata, participants, groupAdmins, isOwner, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply(t.owner);
        let textt = `
╭───「 𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳 」───◆  
│ ∘ 𝙼𝚎𝚜𝚜𝚊𝚐𝚎: ${args.join(' ') || "blank"}  
│ ∘ 𝙰𝚞𝚝𝚑𝚘𝚛: ${pushname}  
│ ∘ 𝙼𝚎𝚖𝚋𝚎𝚛𝚜: ${participants.length}  
│ ∘ ─────────────────
`;

        // Loop through participants and format mentions
        for (let mem of participants) {
            textt += `│ ∘  @${mem.id.split('@')[0]}\n`;
        }

        // Send the message with mentions
        await conn.sendMessage(from, {
            text: textt,
            mentions: participants.map(a => a.id),
        }, { quoted: mek });

       } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

//--------------------------------------------
// TAG_ADMIN COMMANDS
//--------------------------------------------
cmd({
    pattern: "tagadmin",
    category: "group",
    desc: "Tags every admin in the group.",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, groupMetadata, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
         if (!isGroup) return reply(t.group);
        // Filter out non-admins
        let adminParticipants = participants.filter(mem => groupAdmins.includes(mem.id));

        if (adminParticipants.length === 0) {
            return reply("No admins found to tag.");
        }

        let textt = `
╭───「 𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳 」───◆  
│ ∘ 𝙼𝚎𝚜𝚜𝚊𝚐𝚎: ${args.join(' ') || "blank"}  
│ ∘ 𝙰𝚞𝚝𝚑𝚘𝚛: ${pushname}  
│ ∘ 𝙰𝚍𝚖𝚒𝚗𝚜: ${adminParticipants.length}  
│ ∘ ─────────────────
`;

        // Loop through admin participants and format mentions
        for (let mem of adminParticipants) {
            textt += `│ ∘  @${mem.id.split('@')[0]}\n`;
        }

        // Send the message with mentions
        await conn.sendMessage(from, {
            text: textt,
            mentions: adminParticipants.map(a => a.id),
        }, { quoted: mek });

   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//  INVITE COMMANDS
//--------------------------------------------
cmd({
    pattern: "invite",
    alias: ["glink"],
    desc: "Get group invite link.",
    category: "group", // Already group
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, reply }) => {
    try {
        // Ensure this is being used in a group
         if (!isGroup) return reply(t.group);
        // Get the sender's number
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        
        // Check if the bot is an admin
        const groupMetadata = isGroup ? await conn.groupMetadata(from) : '';
        // Get the invite code and generate the link
        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) return reply("Failed to retrieve the invite code.");

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // Reply with the invite link
        return reply(`*Here is your group invite link:*\n${inviteLink}`);
        
    } catch (error) {
        console.error("Error in invite command:", error);
        reply(`An error occurred: ${error.message || "Unknown error"}`);
    }
});
//--------------------------------------------
//  GJID COMMANDS
//--------------------------------------------
cmd({
    pattern: "gjid",
    desc: "Get the list of JIDs and names for all groups the bot is part of.",
    category: "group",
    react: "📝",
    filename: __filename,
}, async (conn, mek, m, { from, isOwner, reply }) => {
     if (!isOwner) return reply(t.owner);
    try {
        // Fetch all groups the bot is part of
        const groups = await conn.groupFetchAllParticipating();

        if (!Object.keys(groups).length) {
            return reply("I am not part of any groups yet.");
        }

        // Prepare the list of groups with names and JIDs
        let groupList = "📝 *Group Names and JIDs:*\n\n";
        for (const jid in groups) {
            const group = groups[jid];
            groupList += `📌 *Name:* ${group.subject}\n🆔 *JID:* ${jid}\n\n`;
        }

        // Send the formatted group list
        reply(groupList);
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
// UPDATE_GNAME COMMANDS
//--------------------------------------------
cmd({
    pattern: "updategname",
    alias: ["upgname","gname"],
    desc: "To Change the group name",
    category: "group",
    use: '.updategname',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins , isAdmins, reply}) => {
try{

      if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);


if (!q) return reply("🖊️ *Please write the new Group Subject*")
await conn.groupUpdateSubject(from, q )
 await conn.sendMessage(from , { text: `✔️ *Group name Updated*` }, { quoted: mek } )
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
// UPDATE_GDESC COMMANDS
//--------------------------------------------
cmd({
    pattern: "updategdesc",
    react: "🔓",
    alias: ["upgdesc", "gdesc"],
    desc: "To change the group description",
    category: "group",
    use: ".updategdesc",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, isBotAdmins, isAdmins, reply }) => {
    try {
     if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);

        if (!q) {
            return reply("🖊️ *Please provide the new group description*");
        }

        await conn.groupUpdateDescription(from, q);
        await conn.sendMessage(from, { text: `✔️ *Group description updated successfully!*` }, { quoted: mek });
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//  REVOKE COMMANDS
//--------------------------------------------
cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["resetglink"],
    desc: "To reset the group link",
    category: "group",
    use: ".revoke",
    filename: __filename
}, async (conn, mek, m, { from, quoted, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
      if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);


        // Revoke the group invite link
        await conn.groupRevokeInvite(from);
        await conn.sendMessage(from, { text: `⛔ *Group link has been reset successfully!*` }, { quoted: mek });
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//--------------------------------------------
//  GINFO COMMANDS
//--------------------------------------------
cmd({
    pattern: "ginfo",
    desc: "Get group information.",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, reply }) => {
    try {
         if (!isGroup) return reply(t.group);
        // Get group metadata
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;
        const groupAdmins = groupMetadata.participants.filter(member => member.admin);
        const memberCount = groupMetadata.participants.length;
        const adminList = groupAdmins.map(admin => `│ ∘  @${admin.id.split('@')[0]}`).join("\n") || "│ ∘ No admins";

        // Format the output
        let textt = `
╭───「 𝙴𝙼𝙿𝙸𝚁𝙴-𝙼𝙳 」───◆  
│ ∘ 𝙶𝚛𝚘𝚞𝚙: ${groupName}  
│ ∘ 𝙶𝚛𝚘𝚞𝚙 𝙸𝙳: ${from}  
│ ∘ 𝚃𝚘𝚝𝚊𝚕 𝙼𝚎𝚖𝚋𝚎𝚛𝚜: ${memberCount}  
│ ∘ ─────────────────  
${adminList}
`;

        // Send the group information
        await conn.sendMessage(from, {
            text: textt,
            mentions: groupAdmins.map(a => a.id),
        }, { quoted: mek });

   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "lockgcs",
    desc: "Change to group settings to only admins can edit group info",
    category: "group",
    use: '.lockgs',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
     if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);

await conn.groupSettingUpdate(from, 'locked')
 await conn.sendMessage(from , { text: `🔒 *Group settings Locked*` }, { quoted: mek } )
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

//allow everyone to modify the group's settings -- like display picture etc.
//await sock.groupSettingUpdate("abcd-xyz@g.us", 'unlocked')

cmd({
    pattern: "unlockgcs",
    react: "🔓",
    desc: "Change to group settings to all members can edit group info",
    category: "group",
    use: '.unlockgs',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
     if (!isOwner) return reply(t.owner);
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);

await conn.groupSettingUpdate(from, 'unlocked')
 await conn.sendMessage(from , { text: `🔓 *Group settings Unlocked*` }, { quoted: mek } )
 } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "setgpp",
    desc: "Set full-screen profile picture for groups.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { quoted, isGroup, isAdmins, reply }) => {
      if (!isGroup) return reply(t.group);
      if (!isAdmins) return reply(t.admin);

    if (!quoted || !quoted.image) return reply("⚠️ Reply to an image to set as the group profile picture.");

    try {
        let media = await quoted.download();
        await conn.updateProfilePicture(m.chat, media);
        reply("✅ Group profile picture updated successfully.");
       } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "getgpp",
    desc: "Fetch the profile picture of the current group chat.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, reply }) => {
 if (!isGroup) return reply(t.group);
    try {
        // Fetch the group profile picture URL
        const groupPicUrl = await conn.profilePictureUrl(m.chat, "image").catch(() => null);

        if (!groupPicUrl) return reply("⚠️ No profile picture found for this group.");

        // Send the group profile picture
        await conn.sendMessage(m.chat, {
            image: { url: groupPicUrl },
            caption: "🖼️ Here is the profile picture of this group chat."
        });
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
