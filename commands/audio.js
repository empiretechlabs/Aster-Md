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
const audioEditor = require("../lib/functions/audio-editor");


// ===================== DEEP =====================
cmd({
  pattern: "deep",
  desc: "Make audio sound deeper",
  category: "audio",
  react: "🗣️",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.deep(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("DEEP ERROR:", e);
    reply("Error processing audio");
  }
});

// ===================== SMOOTH =====================
cmd({
  pattern: "smooth",
  desc: "Smooth out audio",
  category: "audio",
  react: "🌀",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.smooth(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("SMOOTH ERROR:", e);
    reply("Error processing audio");
  }
});


// ===================== FAT =====================
cmd({
  pattern: "fat",
  desc: "Make audio sound fat/bassy",
  category: "audio",
  react: "🍔",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.fat(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("FAT ERROR:", e);
    reply("Error processing audio");
  }
});


// ===================== TUPAI =====================
cmd({
  pattern: "tupai",
  desc: "Special tupai effect",
  category: "audio",
  react: "🐿️",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.tupai(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("TUPAI ERROR:", e);
    reply("Error processing audio");
  }
});


cmd({
  pattern: "slow",
  desc: "Special slow effect",
  category: "audio",
  react: "🐿️",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.tupai(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("slow ERROR:", e);
    reply("Error processing audio");
  }
});

cmd({
  pattern: "reverse",
  desc: "Special reverse effect",
  category: "audio",
  react: "🐿️",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.tupai(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("reverse ERROR:", e);
    reply("Error processing audio");
  }
});


cmd({
  pattern: "fast",
  desc: "Special fast effect",
  category: "audio",
  react: "🐿️",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = m.quoted || m;

    const isAudio =
      quoted.type === "audioMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "audioMessage");

    const isVideo =
      quoted.type === "videoMessage" ||
      (quoted.type === "viewOnceMessage" &&
        quoted.msg?.type === "videoMessage");

    if (!isAudio && !isVideo)
      return reply("Reply to an audio or video");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: mek.key }
    });

    const buffer = await quoted.download();
    const ext = isVideo ? "mp4" : "mp3";

    const audio = await audioEditor.tupai(buffer, ext);

    await conn.sendMessage(
      from,
      { audio: audio, mimetype: "audio/mpeg" },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("fast ERROR:", e);
    reply("Error processing audio");
  }
});
