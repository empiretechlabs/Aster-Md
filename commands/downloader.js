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
const fg = require('api-dylux');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const config = require('../config');
const url = require('url');
const sharp = require('sharp');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const prefix = config.PREFIX;
const googleTTS = require("google-tts-api");
const { instagram } = require("mumaker");
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { getBuffer } = require("../lib/functions/func");
//const audioEditor = require("../lib/functions/audio-editor");




const ffmpeg = require("fluent-ffmpeg");
const { Readable } = require("stream");

function formatAudio(buffer) {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    const chunks = [];

    ffmpeg(stream)
      .audioBitrate(128)
      .format("mp3")
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on("data", d => chunks.push(d));
  });
}

cmd({
    pattern: "audio",
    alias: ["ytmp3"],
    desc: "Download audio from YouTube.",
    category: "downloader",
    react: "⏳",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
try {
    if (!q) return reply("Send me a YouTube URL or title");

    const search = await yts(q);
    const data = search.videos[0];
    const url = data.url;

    await reply(`\`\`\`Downloading ${data.title}\`\`\``);

    const api = `https://api.giftedtech.co.ke/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(url)}`;
    const res = await axios.get(api);
    const endpointResult = res.data.result;

    if (!endpointResult?.download_url) return reply("Failed to fetch audio");

    const bufferRes = await getBuffer(endpointResult.download_url);

    if (!bufferRes) return reply("Failed to download audio buffer");

    const sizeMB = bufferRes.length / (1024 * 1024);
    if (sizeMB > 20) {
      await reply("File is large, processing might take a while...");
    }

    const convertedBuffer = await formatAudio(bufferRes);

    await conn.sendMessage(
      from,
      {
        audio: convertedBuffer,
        mimetype: "audio/mpeg",
        fileName: `${endpointResult.title}.mp3`
      },
      { quoted: mek }
    );

    await m.react("✅");

} catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
}
});

//---------------------------------------------------------------------------
//            VIDEO COMMANDS
//---------------------------------------------------------------------------
cmd({
    pattern: "video",
    alias: ["ytmp4"],
    desc: "Download video from YouTube.",
    category: "downloader",
    react: "⏳",
    filename: __filename
},
async(conn, mek, m,{from, quoted, q, reply}) => {
try {
    if (!q) return reply("Send me a YouTube URL or title");

    const search = await yts(q);
    const data = search.videos[0];
    const url = data.url;

    await reply(`\`\`\`Downloading ${data.title}\`\`\``);

    const res = await axios.get(`https://api.kord.live/api/yt-savetube?url=${encodeURIComponent(url)}&type=720`);
    const result = res.data;

    if (!result?.status || !result?.result?.download) return reply("❌ Failed to get video link");

    await conn.sendMessage(from, {
        video: { url: result.result.download },
        mimetype: "video/mp4",
        fileName: `${result.result.title}.mp4`,
        thumbnail: { url: result.result.thumbnail }
    }, { quoted: mek });

    await m.react("✅");

} catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
}
});
//---------------------------------------------------------------------------
//            TIKTOK COMMANDS
//---------------------------------------------------------------------------
 cmd({
    pattern: "tiktok",
    alias: ["ttdl"],
    desc: "Download a TikTok video without watermark.",
    react: "🎥",
    category: "downloader",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video URL.");

        const apiUrl = `https://api.empiretech.net.ng/api/downloader/tiktok?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        const result = response.data.data.data;
        const title = result.title || "TikTok Video";
        const videoUrl = result.downloadLinks.noWatermark;

        await reply(`_Downloading ${title}_`);

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`
        }, { quoted: mek });

        await m.react("✅");

    } catch (err) {
        console.error(err);
        reply("Error occurred.");
    }
});
//---------------------------------------------------------------------------
//         GOGGLE DRIVE COMMANDS
//---------------------------------------------------------------------------
cmd({
    pattern: "gdrive",
    desc: "Download Google Drive Files",
    category: "downloader",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, pushname, command, args, q, reply }) => {
    try {
        if (!q) {
            return reply("Please send me the Google Drive link.");
        }

        const url = q.trim();
        const apiUrl = `https://api.nexoracle.com/downloader/gdrive?apikey=ae1fa2a45a76baba7d&url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.result || !response.data.result.downloadUrl) {
            return reply("Sorry, I couldn't fetch the file. Make sure the link is valid.");
        }

        const fileData = response.data.result;

        const infoMessage = {
            caption: `
╭─────「 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 」────◆  
│   
│ ∘ 𝙵𝚒𝚕𝚎 𝙽𝚊𝚖𝚎: ${fileData.fileName}  
│ ∘ 𝙼𝙸𝙼𝙴 𝚃𝚢𝚙𝚎: ${fileData.mimetype}  
│ ∘ 𝚂𝚒𝚣𝚎: ${fileData.size}  
│──────────────────────
│ ⦿ 𝙶𝚘𝚘𝚐𝚕𝚎 𝙳𝚛𝚒𝚟𝚎 𝙻𝚒𝚗𝚔: ${url}  
│──────────────────────
│ ${global.caption}  
╰──────────────────────`,
            contextInfo: {
                mentionedJid: [mek.sender],
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363337275149306@newsletter',
                    newsletterName: global.botname,
                    serverMessageId: 143
                }
            }
        };

        await conn.sendMessage(from, infoMessage, { quoted: mek });

        await conn.sendMessage(from, {
            document: { url: fileData.downloadUrl },
            mimetype: fileData.mimetype,
            fileName: fileData.fileName,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: false,
                    title: fileData.fileName,
                    body: global.caption,
                    thumbnailUrl: fileData.thumbnailUrl || global.defaultThumbnail,
                    sourceUrl: global.channelUrl,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mek });

        await m.react("✅");
    } catch (e) {
        console.error("Error in gdrive download command:", e);
        reply(`❌ Error: ${e.message || e.response?.data?.error || e}`);
    }
});
//---------------------------------------------------------------------------
//            PINTEREST COMMANDS
//---------------------------------------------------------------------------
cmd({
    pattern: "pinterest",
    desc: "Download media from Pinterest.",
    category: "downloader",
    filename: __filename,
}, async (conn, mek, m, { args, pushname,reply }) => {
    try {
        const pinterestUrl = args[0];
        if (!pinterestUrl) {
            return reply("Please provide the Pinterest media URL.");
        }

        const response = await axios.get(`https://api.giftedtech.web.id/api/download/pinterestdl?apikey=gifted_api_de5e8gf3cj9c&url=${encodeURIComponent(pinterestUrl)}`);
        const downloadUrl = response.data.result.url;

        if (!downloadUrl) {
            return reply("❌ Unable to fetch the Pinterest media. Please check the URL and try again.");
        }

        await conn.sendMessage(m.from, {
            image: { url: downloadUrl },
            caption: global.caption
        });
        await m.react("✅");
    } catch (err) {
        console.error("Error fetching Pinterest media URL:", err);
        return reply("❌ Unable to fetch Pinterest media. Pl ease try again later.");
    }
});
//---------------------------------------------------------------------------
//            GITCLONE COMMANDS
//---------------------------------------------------------------------------
cmd({
    pattern: "gitclone",
    desc: "Clone a GitHub repository.",
    category: "downloader",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        const repoUrl = args[0];
        if (!repoUrl) return reply("Please provide the GitHub repository URL.");

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return reply("❌ Invalid GitHub URL. Please provide a valid repository link.");

        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");
        const downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

        await conn.sendMessage(m.from, {
            document: { url: downloadUrl },
            fileName: `${repo}.zip`,
            mimetype: "application/zip",
            caption: "GitHub Repository Download",
        });

        await m.react("✅");
    } catch (err) {
        return reply("❌ Unable to fetch GitHub repository. Please try again later.");
    }
});
//---------------------------------------------------------------------------
//            FACEBOOK COMMANDS
//---------------------------------------------------------------------------
cmd({
    pattern: "fbdl",
    desc: "Download Facebook video in HD.",
    react: "📥",
    category: "downloader",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please provide the Facebook video URL.");

        const response = await axios.get(`https://api.giftedtech.web.id/api/download/facebook?apikey=gifted_api_de5e8gf3cj9c&url=${encodeURIComponent(q)}`);
        const data = response.data.result;

        if (!data) return reply("Failed to fetch Facebook video data.");

        const title = data.title || "Facebook Video";
        const thumbnail = data.thumb;
        const videoUrlHD = data.hd;

        if (!videoUrlHD) return reply("HD video not available.");

        // Send initial "downloading" reply
        await reply(`\`\`\`Downloading ${title}\`\`\``);


        // Send thumbnail image with caption
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: `Title: ${title}`
        }, { quoted: mek });

        // Send HD video
        await conn.sendMessage(from, {
            video: { url: videoUrlHD },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`
        }, { quoted: mek });

        await m.react("✅");

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
//---------------------------------------------------------------------------
//            APK COMMANDS
//---------------------------------------------------------------------------
cmd({
    pattern: "apk",
    desc: "Fetches and downloads APK file.",
    category: "downloader",
    react: "📱",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, args, pushname, q, reply }) => {
    try {
        if (!q) {
            return reply(`*Please provide a query, ${pushname}!*`);
        }

        const apiUrl = `https://api.nexoracle.com/downloader/apk?apikey=MepwBcqIM0jYN0okD&q=${encodeURIComponent(q)}`;
        const result = await axios.get(apiUrl);

        if (!result.data) {
            return reply(`*Something went wrong. Please try again later.*`);
        }

        const data = result.data.result;
        const apkUrl = data.dllink;
        const fileName = `${data.name}.apk`;
        const filePath = path.join(__dirname, fileName);

        const response = await axios({
            url: apkUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', async () => {
            await conn.sendMessage(
                from,
                {
                    document: { url: filePath },
                    caption: `
╭──「 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 」───◆
│  
│ ∘ 𝙰𝚙𝚙 𝙽𝚊𝚖𝚎: ${data.name}  
│ ∘ 𝚂𝚒𝚣𝚎: ${data.size}  
│ ∘ 𝚀𝚞𝚎𝚛𝚢: ${q}  
│────────────────
│ ${global.caption}  
╰────────────────`,
                    fileName: fileName,
                    mimetype: "application/vnd.android.package-archive"
                },
                { quoted: mek }
            );

            fs.unlinkSync(filePath);
        });

        writer.on('error', (err) => {
            throw err;
        });

    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});


cmd({
    pattern: "insta",
    alias: ["igdl"],
    desc: "Downloads Instagram videos.",
    category: "downloader",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || !q.startsWith("http")) {
            return reply("❌ Please provide a valid Instagram video URL!");
        }

        const url = q.trim().split(" ")[0];

        // Basic validation
        if (!/^https?:\/\/(www\.)?instagram\.com/.test(url)) {
            return reply("❌ Invalid Instagram link!");
        }

        // FIX: use params instead of manual encode
        const res = await axios.get(`http://193.93.249.232:25342/download/instagram/video`, {
            params: { url }
        });
        const data = res.data;

        if (!data?.success || !data?.result?.download_url) {
            return reply("❌ Failed to fetch video. Please try another URL.");
        }

        await conn.sendMessage(from, {
            video: { url: data.result.download_url },
            mimetype: "video/mp4",
            fileName: `${data.result.title || "instagram_video"}.mp4`
        }, { quoted: mek });

        await m.react("✅");

    } catch (err) {
        console.error("IGDL Error:", err.message);
        reply("⚠️ An error occurred while fetching the video. Please try again later.");
    }
});
    

cmd({
  pattern: "tgs",
  desc: "Download and convert Telegram sticker packs to WhatsApp stickers.",
  category: "downloader",
  filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
  try {
    if (!isOwner) return reply('❌ You are not the owner!');
    if (!args[0]) return reply('*Provide a Telegram sticker pack link!*\n\nExample:\n.tgs https://t.me/addstickers/telegramali');

    const link = args[0];
    const name = link.split('/addstickers/')[1];
    if (!name) return reply('❌ Invalid Telegram sticker pack link!');

    const tgToken = '7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM';
    const getPack = `https://api.telegram.org/bot${tgToken}/getStickerSet?name=${name}`;
    const { data } = await axios.get(getPack);

    const result = data.result;
    const total = result.stickers.length;

    if (result.is_animated || result.is_video) return reply('❌ Animated or video stickers are not supported.');

    await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/qjfqnl.jpg' },
      caption: `*🧩 Empire_Md Telegram Stickers 🧩*\n\n*Pack:* ${result.name}\n*Type:* Static\n*Total:* ${total} stickers\n\n> *Sending stickers...*`
    }, { quoted: mek });

    for (const sticker of result.stickers) {
      const fileData = await axios.get(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${sticker.file_id}`);
      const filePath = fileData.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${tgToken}/${filePath}`;

      const webpBuffer = await getBuffer(fileUrl);

      const stkr = new Sticker(webpBuffer, {
        pack: global.botname,
        author: global.devsname || '𝖤𝗆𝗉𝗂𝗋𝖾 𝖳𝖾𝖼𝗁',
        type: StickerTypes.FULL,
        categories: ['✨', '🔥'],
        id: 'empire-md-tgs',
        quality: 70,
        background: '#000000'
      });

      const stickerBuffer = await stkr.toBuffer();
      await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });

      await new Promise(res => setTimeout(res, 1200)); // delay for rate limit
    }

    reply('_*✅ Sticker Pack Sent Successfully!*_');

  } catch (err) {
    console.error(err);
    reply('❌ Failed to send sticker pack. Make sure the link is correct and all stickers are supported.');
  }
});

cmd({
    pattern: "tts",
    desc: "Convert text to speech.",
    category: "downloader",
    filename: __filename,
    use: "<Enter text to convert into speech>",
}, async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ Please provide a sentence to convert into audio.");

    try {
        const ttsurl = googleTTS.getAudioUrl(q, {
            lang: "en",
            slow: false,
            host: "https://translate.google.com",
        });

        await conn.sendMessage(m.chat, {
            audio: { url: ttsurl },
            mimetype: "audio/mpeg",
            fileName: "tts.mp3",
        }, { quoted: m });
    } catch (err) {
        reply("❌ Failed to generate TTS audio.");
    }
});
