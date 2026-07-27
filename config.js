const fs = require('fs')
if (fs.existsSync('.env')) require('dotenv').config({ path: __dirname+'/.env' })


//═══════[Required Variables]════════\\
global.audio= "" ;  
global.video= "" ;
global.port =process.env.PORT || "3000"
global.appUrl =process.env.APP_URL || process.env.RENDER_EXTERNAL_URL     // put your deploy app/bot url here, for 24/7 for (render , koyeb, glitch)
global.email ="efeurhobobullish@gmail.com"
global.location="Lagos,Africa."


global.mongodb= process.env.MONGODB_URI || ""  
global.allowJids= process.env.ALLOW_JID || "null" 
global.blockJids= process.env.BLOCK_JID || "null"
global.DATABASE_URL = process.env.DATABASE_URL || "false"

global.timezone= process.env.TZ || process.env.TIME_ZONE || "Africa/Lagos";
global.github=process.env.GITHUB|| "https://github.com/empiretechlabs/Empire-Md";
global.gurl  =process.env.GURL  || "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07";
global.website =process.env.WEBURL || "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07" ; 
global.THUMB_IMAGE = process.env.THUMB_IMAGE || process.env.IMAGE || "https://i.ibb.co/TgwRyHR/Ephoto360-com-166de101e03cd7.jpg" || "https://i.ibb.co/bH1kbX0/a4c0b1af253197d4837ff6760d5b81c0.jpg" ; //DO NOT SET LOGO FOR IMAGE 
global.caption = process.env.CAPTION || global.caption || "```『 ᴘᴏᴡᴇʀᴇᴅ ʙʏ Empire Tech Labs ® 』```" 


global.devs = "2348078582627" // Developer Contacts
global.sudo = process.env.SUDO ? process.env.SUDO.replace(/[\s+]/g, '') : "";
global.owner= process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.replace(/[\s+]/g, '') : "2348144250768";


//========================= [ BOT SETTINGS ] ======8===================\\
global.style = process.env.STYLE   || Math.floor(Math.random()*6) || '0'
global.flush = process.env.FLUSH   || "false"; // Make it "true" if bot not responed
global.gdbye = process.env.GOODBYE || process.env.CAN_GOODBYE || "false"; 
global.wlcm  = process.env.WELCOME || process.env.CAN_WELCOME || Math.floor(Math.random()*3)  === 1 ?  "true" : "false" ;  // Make it "false" for disable WELCOME 

global.warncount = process.env.WARN_COUNT || 3 
global.disablepm = process.env.DISABLE_PM || "false"
global.disablegroup = process.env.DISABLE_GROUPS || "false", // disable bot in groups when public mode

global.MsgsInLog = process.env.MSGS_IN_LOG|| "false" // "true"  to see messages , "log" to show logs , "false" to hide logs messages
global.userImages= process.env.USER_IMAGES || "" //"https://i.ibb.co/pXyNHj8/empire.jpg" // "image" // set Image/video urls here
global.waPresence= process.env.WAPRESENCE ||  "null" ; // 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'


//========================= [ AUTO READ MSGS & CMDS ] =========================\\
global.readcmds = process.env.READ_COMMAND || "false"
global.readmessage = process.env.READ_MESSAGE || "false"
global.readmessagefrom = process.env.READ_MESSAGE_FROM || "null,923xxxxxxxx";


//========================= [ AUTO SAVE & READ STATUS ] =========================\\
global.read_status = process.env.AUTO_READ_STATUS || "false"
global.save_status = process.env.AUTO_SAVE_STATUS || "false"
global.auto_like_status = process.env.AUTO_LIKE_STATUS || "false"
global.status_reaction_emoji = process.env.STATUS_REACTION_EMOJI || "random" // set random or 💚
global.save_status_from =  process.env.SAVE_STATUS_FROM  || "null,234xxxxxxxx";
global.read_status_from =  process.env.READ_STATUS_FROM  ||  "234xxxxxxxx";
global.api_smd = "https://empiretech-api.hf.space" // do not change
global.scan = "https://empire-md-session-yfpn.onrender.com"; // DO NOT CHANGE OR TOUCH
global.SESSION_ID = process.env.SESSION_ID || "" // PUT SESSION ID HERE

//========================= [ LANGUAGE & THEME ] =========================\\
// LANGUAGE: en, ur, ar, fr, ha, es, it  |  THEME: EMPIRE, PARKER (branding/images)
global.language = (process.env.LANGUAGE || process.env.LANG_CODE || "en").toLowerCase();
global.theme = (process.env.THEME || "EMPIRE").toUpperCase();
global.currentUserLang = global.language;

global.ELEVENLAB_API_KEY = process.env.ELEVENLAB_API_KEY || "";
global.aitts_Voice_Id = process.env.AITTS_ID|| "37";
global.rank = "updated"
global.isMongodb = false; 

module.exports = {
  antilink_values: process.env.ANTILINK_VALUES || "all",
  author: process.env.PACK_AUTHER || "𝖤𝗆𝗉𝗂𝗋𝖾 𝖳𝖾𝖼𝗁",
  botname: process.env.BOT_NAME || "Empire-Md",
  BRANCH: process.env.BRANCH || "main",
  caption: global.caption || "```『 ᴘᴏᴡᴇʀᴇᴅ ʙʏ Empire Tech Labs ® 』```",
  errorChat: process.env.ERROR_CHAT || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  HF_API_KEY: process.env.HF_API_KEY || "",
  TELEGRAPH_TOKEN: process.env.TELEGRAPH_TOKEN || "",
  HANDLERS: process.env.PREFIX || ".",
  HEROKU: process.env.HEROKU_APP_NAME && process.env.HEROKU_API_KEY,
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || "",
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "",
  KOYEB_API: process.env.KOYEB_API || "false",
  LANG: global.theme,
  LANGUAGE: global.language,
  menu: process.env.MENU || "", // 1: Aztec_Md, 2: A17_Md, 3: Empire-Md Default
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  ownername: process.env.OWNER_NAME || "𝖤𝗆𝗉𝗂𝗋𝖾 𝖳𝖾𝖼𝗁",
  packname: process.env.PACK_NAME || "Sticker By",
  REMOVE_BG_KEY: process.env.REMOVE_BG_KEY || "",
  RENDER_API: process.env.RENDER_API || "",
  SCAN_URL: global.scan,
  SESSION_ID: global.SESSION_ID,
  THEME: global.theme,
  VERSION: process.env.VERSION || "1.0.0-developement",
  WORKTYPE: process.env.WORKTYPE || process.env.MODE || "private",
};

let file = require.resolve(__filename)
fs.watchFile(file, () => { 
  fs.unwatchFile(file);
  console.log(`Update'${__filename}'`);
  delete require.cache[file];    
  require(file);
})