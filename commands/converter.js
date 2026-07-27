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
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');
const prefix = config.PREFIX;

cmd({
    pattern: "tofile",
    desc: "Convert quoted text to a file",
    category: "converter",
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!m.quoted) {
            return reply("❌ Please reply to a *text* message.");
        }

        const quotedMessage = m.quoted;
        const mime = quotedMessage.mimetype; // Access mimetype from the quoted message itself

        // Check if the quoted message is indeed a text message
        if (mime && !mime.startsWith('text/')) { // Check for any text-based mime type
            return reply("❌ Only *plain text* messages are supported.");
        }

        const text = quotedMessage.text || quotedMessage.message?.conversation;

        if (!text) {
            return reply("❌ No text found in the quoted message.");
        }

        const buffer = Buffer.from(text, 'utf-8');

        await conn.sendMessage(m.chat, {
            document: buffer,
            fileName: 'converted.txt',
            mimetype: 'text/plain',
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in tofile command:", error); // Log the error for debugging
        reply(`❌ An error occurred: ${error.message}`);
    }
});



cmd({
    pattern: "tourl",
    alias: "url",
    desc: "Upload Files to Catbox.moe and get a URL.",
    category: "converter",
    react: "⏳",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply, pushname }) => {
    try {
        if (!quoted) return reply(`Reply to an image, video, audio, or document to upload.\nUse *${config.PREFIX}url*`);

        const mediaBuffer = await m.quoted.download();
        if (!mediaBuffer) return reply('❌ Failed to download media. Please try again.');

        const { fileTypeFromBuffer } = await import('file-type');
        const fileType = await fileTypeFromBuffer(mediaBuffer);
        if (!fileType) return reply('❌ Unable to determine the file type of the media.');

        const tempFilePath = path.join(__dirname, `${getRandom(5)}.${fileType.ext}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        const catboxUrl = await Catbox(tempFilePath).catch(err => null);
        fs.unlinkSync(tempFilePath); // Delete temp file after upload

        if (!catboxUrl) return reply('❌ Upload failed. Please try again.');

        const message = `*Hey ${pushname}, Here is your file URL:*\n\n📎 ${catboxUrl}`;
        await conn.sendMessage(from, { text: message }, { quoted: mek });

        await m.react('✅');
    } catch (error) {
        console.error(error);
        reply(`❌ An error occurred while uploading the file: ${error.message}`);
    }
});

cmd({
    pattern: "toimage",
    desc: "Convert sticker to image.",
    category: "converter",
    filename: __filename
}, async (conn, mek, m, { quoted, reply }) => {
    try {
        if (!quoted) return reply("❌ Please reply to a sticker!");
        if (quoted.type !== 'stickerMessage') return reply("❌ Only stickers can be converted to images!");

        const buff = await quoted.getbuff;
        await conn.sendMessage(m.chat, { image: buff });

    } catch (e) {
        console.error(e);
        reply("❌ An error occurred!");
    }
});


cmd({
    pattern: "tiny",
    desc: "Makes URL tiny.",
    category: "converter",
    use: "<url>",
    filename: __filename,
},
async (conn, mek, m, { from, quoted, isOwner, isAdmins, reply, args }) => {
    if (!args[0]) return reply("Provide me a link");

    try {
        const link = args[0];
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${link}`);
        const shortenedUrl = response.data;

        return reply(`*🛡️Your Shortened URL*\n\n${shortenedUrl}`);
    } catch (e) {
        console.error(e);
        return reply("An error occurred while shortening the URL. Please try again.");
    }
});


cmd({
    pattern: "toaudio",
    desc: "Convert video to audio.",
    category: "converter",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!quoted) return reply("❌ Please reply to a video message!");
        if (quoted.type !== 'videoMessage') return reply("❌ Only video messages can be converted to audio!");

        try {
            const buff = await quoted.getbuff;
            await conn.sendMessage(from, {
                audio: buff,
                mimetype: 'audio/mpeg',
                ptt: false
            }); 
        } catch (error) {
            console.error(error);
            reply(`❌ Error: ${error.message}`);
        }
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});

cmd({
    pattern: "fancy",
    desc: "Generate text in fancy fonts.",
    category: "converter",
    use: ".fancy <text>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    if (!q) return reply("❌ Provide text to stylize!\nExample: `.fancy Empire`");

    try {
        const { data } = await axios.get(`https://api.nexoracle.com/misc/stylish-text?apikey=MepwBcqIM0jYN0okD&text=${encodeURIComponent(q)}`);
        
        if (!data?.result?.length) {
            return reply("❌ Failed to fetch fancy fonts. Try again.");
        }

        const fancyList = data.result
            .map((style, i) => style.result ? `${i + 1}. ${style.result}` : null)
            .filter(Boolean)
            .join("\n");

        const promptMsg = await conn.sendMessage(from, {
            text: `*Choose a style by replying with a number:*\n\n${fancyList}`
        }, { quoted: mek });

        const originalMessageId = promptMsg.key.id;

        conn.ev.on("messages.upsert", async (event) => {
            const msg = event.messages[0];
            if (!msg.message) return;

            const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === originalMessageId;

            if (isReply) {
                const selected = parseInt(responseText);
                if (isNaN(selected) || selected < 1 || selected > data.result.length) {
                    return await conn.sendMessage(from, { text: "❌ Invalid number. Please reply with a valid choice." }, { quoted: msg });
                }

                const chosen = data.result[selected - 1].result;
                return await conn.sendMessage(from, { text: `${chosen}` }, { quoted: msg });
            }
        });

    } catch (error) {
        console.error(error);
        return reply("❌ Error fetching fancy text. Try again later.");
    }
});
