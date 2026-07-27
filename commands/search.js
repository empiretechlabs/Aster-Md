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
const moment = require("moment-timezone");
const fg = require('api-dylux');
const config = require('../config');
const prefix = config.PREFIX; 
const { cmd, commands, sck, sck1, warndb, card, chatbot, notes, plugindb, RandomXP, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, saveConfig, Catbox, monospace, dBinary, eBinary, imageToWebp, webp2mp4, videoToWebp, writeExifImg,
  writeExifVid, writeExifWebp
} = require("../lib");
const Jimp = require("jimp");


cmd({
    pattern: "npm",
    desc: "Search npm packages.",
    category: "search",
    use: '<package name>',
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply(`*_Please Provide a package name_*`);

        const { data } = await axios.get(`https://api.npms.io/v2/search?q=${encodeURIComponent(q)}`);

        if (!data || !data.results || data.results.length === 0) {
            return reply(`*_No Result Found. Sorry!!_*`);
        }

        let txt = data.results
            .map(({ package: pkg }) => 
                `*📦 ${pkg.name}* (v${pkg.version})\n🔗 ${pkg.links.npm}\n_${pkg.description || "No description"}_`
            )
            .join('\n\n');

        return reply(txt.trim());

    } catch (e) {
        return reply(`❌ Error: ${e.message || e}\n\n*_Uhh dear, Didn't get any results!_*`);
    }
});

cmd({
    pattern: "couplepp",
    category: "search",
    desc: "Sends couple profile pics in one single collage.",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        let anu = await fetchJson('https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json');
        let random = anu[Math.floor(Math.random() * anu.length)];

        // Load both images with Jimp
        let maleImg = await Jimp.read(random.male);
        let femaleImg = await Jimp.read(random.female);

        // Resize both to same height
        maleImg.resize(300, Jimp.AUTO);
        femaleImg.resize(300, Jimp.AUTO);

        // Create new canvas for side-by-side collage
        let collage = new Jimp(maleImg.bitmap.width + femaleImg.bitmap.width, maleImg.bitmap.height);

        collage.composite(maleImg, 0, 0);
        collage.composite(femaleImg, maleImg.bitmap.width, 0);

        // Save collage buffer
        let buffer = await collage.getBufferAsync(Jimp.MIME_JPEG);

        // Send as one image
        await conn.sendMessage(from, { image: buffer, caption: `*✦ Couple Profile Pics ✦*` }, { quoted: mek });

    } catch (e) {
        return reply(`❌ Error: ${e.message || e}\n\n*_Uhh dear, Didn't get any results!_*`);
    }
});

cmd({
    pattern: "cric",
    category: "search",
    desc: "Sends info of ongoing cricket matches.",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushname, q }) => {
    try {
        await reply(`*_Please Wait, Getting Cricket Info..._*`);

        const response = await fetch('https://api.cricapi.com/v1/currentMatches?apikey=f68d1cb5-a9c9-47c5-8fcd-fbfe52bace78');
        const dat = await response.json();

        if (!dat || !dat.data || dat.data.length === 0) {
            return reply(`*_No live or recent matches found right now_*`);
        }

        let text = `*_🏏 Current Cricket Matches_*_\n`;

        for (let i = 0; i < dat.data.length; i++) {
            let j = i + 1;
            let match = dat.data[i];

            text += `\n*--------------------- MATCH ${j} -------------------*`;
            text += `\n*Match Name:* ${match.name || "N/A"}`;
            text += `\n*Status:* ${match.status || "N/A"}`;
            text += `\n*Date:* ${match.dateTimeGMT || "N/A"}`;
            text += `\n*Started:* ${match.matchStarted ? "Yes ✅" : "No ❌"}`;
            text += `\n*Ended:* ${match.matchEnded ? "Yes ✅" : "No ❌"}`;
            text += `\n`;
        }

        return reply(text);

    } catch (e) {
        return reply(`❌ Error: ${e.message || e}\n\n*_Uhh dear, Didn't get any results!_*`);
    }
});

cmd({
    pattern: "time",
    desc: "Get current time by country code or name.",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushname, q }) => {
    try {
        if (!q) {
            return reply(`Hello *_${pushname}_,*\nPlease provide a country name or code.\nExample: *time Nigeria*`);
        }

        const apiUrl = `https://levanter.onrender.com/time?code=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        const result = res.data;

        if (result && result.result && result.result.length > 0) {
            const { name, timeZone, time } = result.result[0];

            return reply(
                `Hello *_${pushname}_,*\n` +
                `Here are the current time stats for *${name}*:\n\n` +
                `*Date & Time:* ${time}\n` +
                `*Timezone:* ${timeZone}\n\n` +
                `${global.caption}`
            );
        }

    } catch (error) {
        return reply(`❌ Error: ${error.message}`);
    }
});


cmd({
    pattern: "ss",
    desc: "Screenshot a website",
    category: "search", // Category updated to 'search'
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
     try {
        if (!q) return reply("Please send the website URL to screenshot.");

        const url = q.trim();
        if (!/^https?:\/\//.test(url)) {
            return reply("Please enter a valid URL starting with http:// or https://");
        }

        // Screenshot API endpoint with API key
        const screenshotApi = `https://api.nexoracle.com/misc/ss-phone?apikey=MepwBcqIM0jYN0okD&url=${encodeURIComponent(url)}`;

        // Fetch the screenshot
        const webimage = await axios.get(screenshotApi, { responseType: 'arraybuffer' });

        await conn.sendMessage(from, {
            image: Buffer.from(webimage.data),
            mimetype: "image/png"
        }, { quoted: mek });

    } catch (e) {
        console.error(e.response?.data || e.message); // Log detailed error
        reply(`An error occurred: ${e.response?.data?.error || e.message}`);
    }
});

//--------------------------------------------
// TRANSLATE COMMANDS
//--------------------------------------------
cmd({
    pattern: "translate",
    desc: "Translate the given text to a specified language.",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        // Check if the user provided text to translate and a target language
        if (args.length < 2) {
            return reply("Please provide both the text to translate and the language code (e.g., `!translate Hola to en`).");
        }

        // Extract the text to translate and the language code
        const text = args.slice(0, args.length - 1).join(" ");
        const targetLang = args[args.length - 1];

        // URL encode the text
        const encodedText = encodeURIComponent(text);

        // API endpoint with the text and target language
        const apiUrl = `https://api.nexoracle.com/misc/translate?apikey=MepwBcqIM0jYN0okD&text=${encodedText}&to=${targetLang}`;

        // Send the request to the translation API
        const response = await axios.get(apiUrl);

        // Extract the translated text from the response
        const translatedText = response.data.result;

        // If translation is successful, send the translated text to the user
        if (translatedText) {
            return reply(`Here is the translation:\n\`\`\`\n${translatedText}\n\`\`\``);
        } else {
            return reply("Sorry, I couldn't translate the text. Please try again later.");
        }
    } catch (error) {
        console.error("Error during translation:", error);
        return reply("❌ An error occurred while translating. Please try again later.");
    }
});
//--------------------------------------------
// WEATHER COMMANDS
//--------------------------------------------
cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❗ Please provide a city name. Usage: .weather [city name]");
        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        const weather = `
╭────「 𝚆𝙴𝙰𝚃𝙷𝙴𝚁 𝙸𝙽𝙵𝙾 」────◆  
│ ∘ 𝙻𝚘𝚌𝚊𝚝𝚒𝚘𝚗: ${data.name}, ${data.sys.country}  
│ ∘ 𝚃𝚎𝚖𝚙𝚎𝚛𝚊𝚝𝚞𝚛𝚎: ${data.main.temp}°C  
│ ∘ 𝙵𝚎𝚎𝚕𝚜 𝙻𝚒𝚔𝚎: ${data.main.feels_like}°C  
│ ∘ 𝙼𝚒𝚗 𝚃𝚎𝚖𝚙: ${data.main.temp_min}°C  
│ ∘ 𝙼𝚊𝚡 𝚃𝚎𝚖𝚙: ${data.main.temp_max}°C  
│ ∘ 𝙷𝚞𝚖𝚒𝚍𝚒𝚝𝚢: ${data.main.humidity}%  
│ ∘ 𝚆𝚎𝚊𝚝𝚑𝚎𝚛: ${data.weather[0].main}  
│ ∘ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗: ${data.weather[0].description}  
│ ∘ 𝚆𝚒𝚗𝚍 𝚂𝚙𝚎𝚎𝚍: ${data.wind.speed} m/s  
│ ∘ 𝙿𝚛𝚎𝚜𝚜𝚞𝚛𝚎: ${data.main.pressure} hPa  
╰────────────────────◆  

${global.caption}
`;
        return reply(weather);
    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 City not found. Please check the spelling and try again.");
        }
        return reply("⚠️ An error occurred while fetching the weather information. Please try again later.");
    }
});

cmd({
    pattern: "domain",
    desc: "Fetch domain details",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, args, q, pushname, reply }) => {
    try {
        if (!q) return reply("Provide a domain to look up!");

        const url = `https://api.nexoracle.com/details/domain?apikey=MepwBcqIM0jYN0okD&q=${encodeURIComponent(q)}`;
        const data = await fetchJson(url);

        if (!data?.result?.length) return reply("No domain details found!");

        const domains = [...new Set(data.result)]; // Remove duplicates
        const domainList = domains.map((domain) => `┃   ➜ ${domain}`).join("\n");

        const response = `┏━━⟪ *DOMAIN Lookup* ⟫━━⦿
┃ ✗ Requested By: ${pushname}
┃ ✗ Domains:
${domainList}
┗━━━━━━━━━━━━━━━`;

        reply(response);
    } catch (e) {
        console.log(e);
        reply(`error: ${e}`);
    }
});

cmd({
    pattern: "couplepp",
    desc: "Sends two couple pictures.",
    category: "search",
    react: "💑",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const anu = await fetchJson("https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json");
        const random = anu[Math.floor(Math.random() * anu.length)];

        await conn.sendMessage(m.from, { image: { url: random.male }, caption: "👦 Couple Male" }, { quoted: mek });
        await conn.sendMessage(m.from, { image: { url: random.female }, caption: "👧 Couple Female" }, { quoted: mek });

    } catch (error) {
        return reply("❌ Failed to fetch couple pictures.");
    }
});

cmd({
    pattern: "iswa",
    category: "search",
    desc: "Searches in given range about given number.",
    use: "23480785826xx",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (!q.includes("x")) return reply("❌ You did not add 'x'\nExample: iswa 23480785826xx");

    reply("🔍 Searching for WhatsApp account in given range...");

    const countInstances = (string, word) => string.split(word).length - 1;
    const [number0, number1] = q.split("x");
    const randomLength = countInstances(q, "x");

    let randomxx = randomLength === 1 ? 10 : randomLength === 2 ? 100 : 1000;

    let textOutput = `*--『 List of WhatsApp Numbers 』--*\n\n`;
    let noBio = `\n*📌 Bio:* || \nHey there! I am using WhatsApp.\n`;
    let noWhatsapp = `\n🚫 *Numbers with no WhatsApp account in the given range.*\n`;

    for (let i = 0; i < randomxx; i++) {
        const random = [...Array(randomLength)].map(() => Math.floor(Math.random() * 9) + 1).join("");

        const anu = await conn.onWhatsApp(`${number0}${random}${number1}@s.whatsapp.net`);
        if (anu.length !== 0) {
            const anu1 = await conn.fetchStatus(anu[0].jid).catch(() => "401");
            if (anu1 === "401" || !anu1.status) {
                noBio += `wa.me/${anu[0].jid.split("@")[0]}\n`;
            } else {
                textOutput += `🧐 *Number:* wa.me/${anu[0].jid.split("@")[0]}\n✨ *Bio:* ${anu1.status}\n📅 *Last Update:* ${moment(anu1.setAt).tz("Africa/Lagos").format("HH:mm:ss DD/MM/YYYY")}\n\n`;
            }
        } else {
            noWhatsapp += `${number0}${random}${number1}\n`;
        }
    }

    return reply(`${textOutput}${noBio}${noWhatsapp}`);
});

cmd({
    pattern: "nowa",
    category: "search",
    desc: "Find numbers that are not on WhatsApp.",
    use: "23480785826xx",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (!q.includes("x")) return reply("❌ You did not add 'x'\nExample: nowa 23480785826xx");

    reply("🔍 Searching for numbers *not* on WhatsApp in the given range...");

    const countInstances = (string, word) => string.split(word).length - 1;
    const [number0, number1] = q.split("x");
    const randomLength = countInstances(q, "x");

    let randomxx = randomLength === 1 ? 10 : randomLength === 2 ? 100 : 1000;

    let noWhatsapp = `🚫 *Numbers that are NOT on WhatsApp in the given range:*\n`;

    for (let i = 0; i < randomxx; i++) {
        const random = [...Array(randomLength)].map(() => Math.floor(Math.random() * 9) + 1).join("");
        const fullNumber = `${number0}${random}${number1}`;

        const anu = await conn.onWhatsApp(`${fullNumber}@s.whatsapp.net`);
        if (anu.length === 0) {
            noWhatsapp += `- ${fullNumber}\n`;
        }
    }

    return reply(noWhatsapp);
});

cmd({
    pattern: "define",
    desc: "Get definition from Urban Dictionary.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("Provide a word to define!");

        const { data } = await axios.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(q)}`);
        
        if (!data.list.length) return reply(`No result found for "${q}"`);

        const definition = data.list[0].definition.replace(//g, "").replace(//g, "");
        const example = data.list[0].example.replace(//g, "").replace(//g, "");

        let response = `*Word:* ${q}\n\n*Definition:* ${definition}\n\n*Example:* ${example}`;
        return reply(response);
    } catch (e) {
        console.log(e);
        reply(`error: ${e}`);
    }
});

cmd({
    pattern: "img",
    desc: "Search and send images from Google.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    try {
        if (!q) return reply("Example\n img Empire_Md|5.");

        // Split query and limit
        let [searchText, limit] = q.split("|").map(s => s.trim());
        limit = parseInt(limit) || 2; // Default to 5 if not specified

        const searchQuery = encodeURIComponent(searchText);
        const url = `https://api.nexoracle.com/search/google-image?apikey=MepwBcqIM0jYN0okD&q=${searchQuery}`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.status !== 200 || !data.result || data.result.length === 0) {
            return reply("No images found for your query.");
        }

        // Limit results
        const images = data.result.slice(0, limit);

        // Send images without caption
        for (const imageUrl of images) {
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data, 'binary');

            await conn.sendMessage(from, {
                image: buffer
            }, { quoted: mek });
        }

    } catch (e) {
        console.error(e);
        reply(`Error: ${e.message}`);
    }
});