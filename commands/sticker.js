const theme = require('../Themes/Empire_Md.json');
const t = theme.STRINGS.global;
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const { downloadMediaMessage } = require('baileys-pro');
const fs = require('fs');
const path = require('path');
const ffmpeg = require("fluent-ffmpeg");
const imgmsg = 'Reply to a photo for sticker!';  
const descg = 'It converts your replied photo to a sticker.';
const { exec } = require('child_process');
const { execSync } = require('child_process');
const axios = require('axios');


cmd({
  pattern: "sticker",
  desc: "Convert image or video to sticker",
  category: "sticker",
  use: ".s <reply to image/video>",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply, q }) => {
  try {
    const quoted = m.quoted || m;

    /* ---------- IMAGE → STICKER (UNCHANGED, WORKING) ---------- */
    const isImage =
      quoted.type === "imageMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "imageMessage");

    if (isImage) {
      const imageBuffer = await quoted.download();
      const nameJpg = getRandom(".jpg");
      await fs.promises.writeFile(nameJpg, imageBuffer);

      const sticker = new Sticker(nameJpg, {
        pack: t.botName || "Empire_Md",
        author: theme.AUTHOR || "Empire Tech",
        type: q.includes("--crop") || q.includes("-c")
          ? StickerTypes.CROPPED
          : StickerTypes.FULL,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 75,
        background: "transparent",
      });

      const buffer = await sticker.toBuffer();
      fs.unlinkSync(nameJpg);

      return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
    }

    /* ---------- VIDEO → STICKER (FIXED, NEW) ---------- */
    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (isVideo) {
      if (quoted.msg?.seconds > 20) {
        return reply("Video too long. Max 20 seconds.");
      }

      const videoBuffer = await quoted.download();

      const webpBuffer = await videoToWebp(videoBuffer);
      const stickerPath = await writeExifWebp(webpBuffer, {
        packname: t.botName || "Empire_Md",
        author: theme.AUTHOR || "Empire Tech",
        categories: ["🤩", "🎉"],
      });

      return conn.sendMessage(
        from,
        { sticker: fs.readFileSync(stickerPath) },
        { quoted: mek }
      );
    }

    return reply("Reply to an image or a short video");

  } catch (e) {
    console.error("STICKER ERROR:", e);
    reply("Error converting media");
  }
});

  
cmd({
  pattern: "quotely",
  desc: "Makes a sticker from quoted text.",
  alias: ["q"],
  category: "sticker",
  use: "<reply to any message>",
  filename: __filename
}, async (conn, mek, m, { from, q, quoted, pushName, body, reply }) => {
  try {
    if (!m.quoted) return reply("_Reply to a message.._");

    const username = await sck1.findOne({ id: m.quoted.sender });
    let tname = "";
    if (username && username.name) {
      tname = username.name;
    }

    const profilePic = await conn.profilePictureUrl(m.quoted.sender, "image")
      .catch(() => "https://files.catbox.moe/wpi099.png");

    const backgroundColor = "#FFFFFF";

    const quotedText = (m.quoted.conversation || m.quoted.caption || m.quoted.text || "").trim();
    if (!quotedText) return reply("_No text in the quoted message._");

    const payload = {
      type: "quote",
      format: "png",
      backgroundColor,
      width: 512,
      height: 512,
      scale: 3,
      messages: [
        {
          avatar: true,
          from: {
            first_name: tname || "User",
            language_code: "en",
            name: tname || "User",
            photo: { url: profilePic },
          },
          text: quotedText,
          replyMessage: {},
        },
      ],
    };

    const res = await axios.post("https://bot.lyo.su/quote/generate", payload);
    const imageBuffer = await getBuffer("data:image/png;base64," + res.data.result.image);

    const sticker = new Sticker(imageBuffer, {
      pack: t.botName || "Empire_Md",
      author: theme.AUTHOR || "Empire Tech",
      type: StickerTypes.FULL,
      quality: 75,
    });

    const buffer = await sticker.toBuffer();
    await conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
  } catch (e) {
    console.error("Quotely error:", e);
    return reply(`${e}`);
  }
});
//--------------------------------------------
//    STICKER COMMANDS
//--------------------------------------------
cmd({
    pattern: "s",
    desc: "Change image to sticker.",
    category: "sticker",
    use: ".sticker <Reply to image>",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCmd, command, args, q, isGroup, pushname }) => {
    try {
        const isQuotedImage = m.quoted && (m.quoted.type === 'imageMessage' || (m.quoted.type === 'viewOnceMessage' && m.quoted.msg.type === 'imageMessage'));
        const isQuotedSticker = m.quoted && m.quoted.type === 'stickerMessage';

        if ((m.type === 'imageMessage') || isQuotedImage) {
            const nameJpg = getRandom('.jpg');
            const imageBuffer = isQuotedImage ? await m.quoted.download() : await m.download();
            await fs.promises.writeFile(nameJpg, imageBuffer);

            let sticker = new Sticker(nameJpg, {
                pack: t.botName,
                author: theme.AUTHOR,
                type: q.includes('--crop') || q.includes('-c') ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories: ['🤩', '🎉'], 
                id: '12345',
                quality: 75, 
                background: 'transparent',
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else if (isQuotedSticker) {
            const nameWebp = getRandom('.webp');
            const stickerBuffer = await m.quoted.download();
            await fs.promises.writeFile(nameWebp, stickerBuffer);

            let sticker = new Sticker(nameWebp, {
                pack: t.botName || "Empire_Md",
                author: theme.AUTHOR || "Empire Tech",
                type: q.includes('--crop') || q.includes('-c') ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345', 
                quality: 75, 
                background: 'transparent',
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else {
            return await reply(imgmsg);
        }
    } catch (e) {
        reply('Error !!');
        console.error(e);
    }
});
//--------------------------------------------
//  ROUND STICKER COMMANDS
//--------------------------------------------
cmd({
    pattern: "round",
    desc: "Change image to round sticker.",
    category: "sticker",
    use: ".roundsticker <Reply to image>",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCmd, command, args, q, isGroup, pushname }) => {
    try {
        const isQuotedImage = m.quoted && (m.quoted.type === 'imageMessage' || (m.quoted.type === 'viewOnceMessage' && m.quoted.msg.type === 'imageMessage'));
        const isQuotedSticker = m.quoted && m.quoted.type === 'stickerMessage';

        if ((m.type === 'imageMessage') || isQuotedImage) {
            const nameJpg = getRandom('.jpg');
            const imageBuffer = isQuotedImage ? await m.quoted.download() : await m.download();
            await fs.promises.writeFile(nameJpg, imageBuffer);

            let sticker = new Sticker(nameJpg, {
                pack: t.botName || "Empire_Md",
                author: theme.AUTHOR || "Empire Tech",
                type: StickerTypes.ROUND, // Round sticker type
                categories: ['🤩', '🎉'], // Sticker categories
                id: '12345', // Sticker id
                quality: 75, // Quality of the sticker
                background: 'transparent', // Transparent background for round stickers
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else if (isQuotedSticker) {
            const nameWebp = getRandom('.webp');
            const stickerBuffer = await m.quoted.download();
            await fs.promises.writeFile(nameWebp, stickerBuffer);

            let sticker = new Sticker(nameWebp, {
                pack: t.botName || "Empire_Md",
                author: theme.AUTHOR || "Empire Tech",
                type: StickerTypes.ROUND, // Round sticker type
                categories: ['🤩', '🎉'], // Sticker categories
                id: '12345', // Sticker id
                quality: 75, // Quality of the sticker
                background: 'transparent', // Transparent background for round stickers
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else {
            return await reply(imgmsg); // Return the default message if no image or sticker is found.
        }
    } catch (e) {
        reply('Error !!');
        console.error(e);
    }
});
//--------------------------------------------
// CROP STICKER COMMANDS
//--------------------------------------------
cmd({
    pattern: "crop",
    desc: "Change image to cropped sticker.",
    category: "sticker",
    use: ".cropsticker <Reply to image>",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCmd, command, args, q, isGroup, pushname }) => {
    try {
        const isQuotedImage = m.quoted && (m.quoted.type === 'imageMessage' || (m.quoted.type === 'viewOnceMessage' && m.quoted.msg.type === 'imageMessage'));
        const isQuotedSticker = m.quoted && m.quoted.type === 'stickerMessage';

        if ((m.type === 'imageMessage') || isQuotedImage) {
            const nameJpg = getRandom('.jpg');
            const imageBuffer = isQuotedImage ? await m.quoted.download() : await m.download();
            await fs.promises.writeFile(nameJpg, imageBuffer);

            let sticker = new Sticker(nameJpg, {
                pack: global.botname, // Use global.botname for the sticker pack
                author: global.devsname || 'Hacker Only_🥇Empire', // Use global.devsname for the author
                type: StickerTypes.CROPPED, // CROP sticker type
                categories: ['🤩', '🎉'], // Sticker categories
                id: '12345', // Sticker id
                quality: 75, // Quality of the sticker
                background: 'transparent', // Transparent background for cropped stickers
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else if (isQuotedSticker) {
            const nameWebp = getRandom('.webp');
            const stickerBuffer = await m.quoted.download();
            await fs.promises.writeFile(nameWebp, stickerBuffer);

            let sticker = new Sticker(nameWebp, {
                pack: t.botName || "Empire_Md",
                author: theme.AUTHOR || "Empire Tech",
                type: StickerTypes.CROPPED, // CROP sticker type
                categories: ['🤩', '🎉'], // Sticker categories
                id: '12345', // Sticker id
                quality: 75, // Quality of the sticker
                background: 'transparent', // Transparent background for cropped stickers
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else {
            return await reply(imgmsg); // Return the default message if no image or sticker is found.
        }
    } catch (e) {
        reply('Error !!');
        console.error(e);
    }
});

cmd({
    pattern: "circle",
    desc: "Change sticker to circle.",
    category: "sticker",
    use: ".circle <Reply to sticker>",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const isQuotedSticker = m.quoted && m.quoted.type === 'stickerMessage';

        if (isQuotedSticker) {
            const nameWebp = getRandom('.webp');
            const stickerBuffer = await m.quoted.download();
            await fs.promises.writeFile(nameWebp, stickerBuffer);

            let sticker = new Sticker(nameWebp, {
                pack: t.botName || "Empire_Md",
                author: theme.AUTHOR || "Empire Tech",
                type: StickerTypes.CIRCLE, // CIRCLE sticker type
                categories: ['🤩', '🎉'], // Sticker categories
                id: '12345', // Sticker id
                quality: 75, // Quality of the sticker
                background: 'transparent', // Transparent background for circular stickers
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } else {
            return await reply('Reply to a sticker to make it circular!');
        }
    } catch (e) {
        reply('Error !!');
        console.error(e);
    }
});
