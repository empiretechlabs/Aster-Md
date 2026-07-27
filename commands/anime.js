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
const axios = require('axios');
const config = require('../config');
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");

const prefix = config.PREFIX;
const t = require('../Themes/Empire_Md.json').STRINGS.global;


cmd({
  pattern: "foxgirl",
  category: "anime",
  desc: "Sends image of Fox Girl in current chat.",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const response = await axios.get("https://nekos.life/api/v2/img/fox_girl");
    if (response.data && response.data.url) {
      const imageMessage = {
        image: { url: response.data.url }
      };
      await conn.sendMessage(from, imageMessage);
    } else {
      reply("Sorry, I couldn't fetch a Fox Girl image. Please try again later.");
    }
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
  pattern: "loli",
  desc: "Fetch a random anime girl image.",
  category: "anime",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const response = await axios.get("https://waifu.pics/api/sfw/shinobu");
    if (response.data && response.data.url) {
      const imageMessage = {
        image: { url: response.data.url }
      };
      await conn.sendMessage(from, imageMessage, { quoted: mek });
    } else {
      reply("Sorry, I couldn't fetch an image. Please try again later.");
    }
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
  pattern: "neko",
  desc: "Fetch a random neko anime image.",
  category: "anime",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const response = await axios.get("https://waifu.pics/api/sfw/neko");
    if (response.data && response.data.url) {
      const imageMessage = {
        image: { url: response.data.url }
      };
      await conn.sendMessage(from, imageMessage, { quoted: mek });
    } else {
      reply("Sorry, I couldn't fetch a Neko image. Please try again later.");
    }
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
  pattern: "naruto",
  desc: "Fetch a random Naruto anime image.",
  category: "anime",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const imageBuffer = await getBuffer(`${t.api}/anime/naruto?apikey=${t.apikey}`);
    await conn.sendMessage(from, { image: imageBuffer }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
  pattern: "nezuko",
  desc: "Fetch a random Nezuko anime image.",
  category: "anime",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const imageBuffer = await getBuffer(`${t.api}/anime/nezuko?apikey=${t.apikey}`);
    await conn.sendMessage(from, { image: imageBuffer }, { quoted: mek });
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
  pattern: "gremory",
  desc: "Fetch a random Gremory anime image.",
  category: "anime",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const imageBuffer = await getBuffer(`${t.api}/anime/gremory?apikey=${t.apikey}`);
    await conn.sendMessage(from, { image: imageBuffer }, { quoted: mek });
   } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});