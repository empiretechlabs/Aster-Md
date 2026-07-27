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
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const axios = require('axios');
//--------------------------------------------
// BLACKBOX COMMANDS
//--------------------------------------------
cmd({
    pattern: "blackbox",
    desc: "AI chat using Blackbox AI",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
    if (!q) {
        return reply("Please provide a query for Blackbox AI.");
    }

    // Fetch the response from the Blackbox AI API
    const response = await axios.get(`https://api.giftedtech.web.id/api/ai/blackbox?apikey=gifted_api_de5e8gf3cj9c&q=${encodeURIComponent(q)}`);

    // Reply with the AI's response
    return reply(`${response.data.result}`);
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
        
//--------------------------------------------
// GEMINI COMMANDS
//--------------------------------------------
cmd({
    pattern: "gemini",
    desc: "AI chat from Gemini AI",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) {
            return reply("Hello! How can I assist you with Gemini AI today?");
        }

        let data = await fetchJson(`https://api.giftedtech.web.id/api/ai/geminiai?apikey=gifted_api_de5e8gf3cj9c&q=${encodeURIComponent(q)}`);
        return reply(`${data.result}`);
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
//--------------------------------------------
// GPT COMMANDS
//--------------------------------------------
cmd({
    pattern: "gpt",
    desc: "ai chat from chat gpt",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) {
            
            return reply("Hello! How can I assist you today?");
        }

        
        let data = await fetchJson(`https://api.giftedtech.web.id/api/ai/gpt?apikey=gifted_api_de5e8gf3cj9c&q=${encodeURIComponent(q)}`);
        return reply(`${data.result}`);
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
//--------------------------------------------
// GPT-4 COMMANDS
//--------------------------------------------
cmd({
    pattern: "gpt-4",
    desc: "ai chat from chat gpt-4",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) {
            
            return reply("Hello! How can I assist you today?");
        }

        
        let data = await fetchJson(`https://api.giftedtech.web.id/api/ai/gpt4?apikey=gifted_api_de5e8gf3cj9c&q=${encodeURIComponent(q)}`);
        return reply(`${data.result}`);
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
//--------------------------------------------
// LET-ME-GPT COMMANDS
//--------------------------------------------
cmd({
    pattern: "letmegpt",
    desc: "AI chat using LetMeGPT",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) {
            return reply("Please provide a query for LetMeGPT.");
        }

        // Fetch the response from the LetMeGPT API
        let data = await fetchJson(`https://api.giftedtech.web.id/api/ai/letmegpt?apikey=gifted_api_de5e8gf3cj9c&q=${encodeURIComponent(q)}`);
        
        // Reply with the AI's response
        return reply(`${data.result}`);
    } catch (e) {
        console.log(e); // Log any error for debugging
        reply(`Error: ${e.message}`);
    }
});

//--------------------------------------------
// IMAGINE COMMANDS
//--------------------------------------------
cmd({
  pattern: "imagine",
  desc: "Generate an image using AI API.",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, {
  from, quoted, body, isCmd, command, args, q, isGroup,
  sender, senderNumber, botNumber2, botNumber, pushname,
  isMe, isOwner, groupMetadata, groupName, participants,
  groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    if (!q) {
      return reply("Please provide a prompt to generate an image.");
    }

    const response = await fetchJson(`https://api.giftedtech.web.id/api/ai/fluximg?apikey=gifted_api_de5e8gf3cj9c&prompt=${q}`);
    
    const imageUrl = response.result;
    await conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: `Prompt: ${q}` });
  } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});