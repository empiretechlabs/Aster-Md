const axios = require("axios");
const fs = require("fs-extra");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Jimp = require('jimp');
const fetch = require("node-fetch");
const gis = require("async-g-i-s");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const { textpro } = require('mumaker');
const { getBuffer, fetchJson, runtime, sleep, isUrl, GIFBufferToVideoBuffer } = require("./msg.js");
const { tlang, TelegraPh, dare, truth, random_question } = require("./helpers");
const { bot_ } = require('./database');
const { existsSync, mkdirSync, createWriteStream } = require('fs');

const Config = require("../config.js");
let caption = Config.caption || '';

async function sendAnimeReaction(msg, reaction = "punch", actionText = '', selfActionText = '') {
  try {
    var response = await fetchJson("https://api.waifu.pics/sfw/" + reaction);
    const imageData = await axios.get(response.url, {
      'responseType': "arraybuffer"
    });
    const buffer = Buffer.from(imageData.data, "utf-8");
    let targetUser = msg.mentionedJid ? msg.mentionedJid[0] : msg.quoted ? msg.quoted.sender : false;
    let videoBuffer = await GIFBufferToVideoBuffer(buffer);
    let caption = targetUser ? "*@" + msg.sender.split('@')[0] + " " + actionText + " @" + targetUser.split('@')[0] + '*' : "*@" + msg.sender.split('@')[0] + " " + selfActionText + '*';
    return targetUser ? await msg.bot.sendMessage(msg.chat, {
      'video': videoBuffer,
      'gifPlayback': true,
      'mentions': [targetUser, msg.sender],
      'caption': caption
    }, {
      'quoted': msg,
      'messageId': msg.bot.messageId()
    }) : await msg.bot.sendMessage(msg.chat, {
      'video': videoBuffer,
      'gifPlayback': true,
      'mentions': [msg.sender],
      'caption': caption
    }, {
      'quoted': msg,
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    return await msg.error(error + "\nERROR AT : /lib/Empire.js/sendAnimeReaction()\n\ncommand: " + reaction);
  }
}

async function sendGImages(msg, query, imageCaption = caption, additionalText = '') {
  try {
    let images = await gis(query);
    let randomImage = images[Math.floor(Math.random() * images.length)].url;
    let messageContent = {
      'image': {
        'url': randomImage
      },
      'caption': imageCaption,
      'contextInfo': {
        'externalAdReply': {
          'title': tlang().title,
          'body': additionalText,
          'thumbnail': log0,
          'mediaType': 1,
          'mediaUrl': gurl,
          'sourceUrl': gurl
        }
      }
    };
    return await msg.bot.sendMessage(msg.chat, messageContent, {
      'quoted': msg,
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    await msg.error(error);
    return console.log("./lib/Empire.js/sendGImages()\n", error);
  }
}

async function AudioToBlackVideo(audioPath, outputPath) {
  try {
    try {
      fs.unlinkSync(outputPath);
    } catch (e) {}
    const durationCmd = "ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 " + audioPath;
    const {
      stdout: durationStr
    } = await exec(durationCmd);
    const duration = parseFloat(durationStr);
    try {
      fs.unlinkSync("./temp/blackScreen.mp4");
    } catch (e) {}
    const blackScreenCmd = "ffmpeg -f lavfi -i color=c=black:s=1280x720:d=" + duration + " -vf \"format=yuv420p\" " + "./temp/blackScreen.mp4";
    await exec(blackScreenCmd);
    const mergeCmd = "ffmpeg -i ./temp/blackScreen.mp4 -i " + audioPath + " -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 " + outputPath;
    await exec(mergeCmd);
    console.log("Audio converted to black screen video successfully!");
    return {
      'result': true
    };
  } catch (error) {
    console.error("./lib/Aviator.js/AudioToBlackVideo()\n", error);
    return {
      'result': false
    };
  }
}

async function textToLogoGenerator(msg, effect = '', text1 = '', text2 = "ser", service = "textpro", showError = true) {
  let result = {};
  let apiResult = {};
  let url = /1|ephoto|ephoto360/gi.test(service) ? "https://ephoto360.com/" + effect + ".html" : /2|potoxy|photooxy/gi.test(service) ? 'https://photooxy.com/' + effect + '.html' : /3|enphoto|en360/gi.test(service) ? 'https://en.ephoto360.com/' + effect + ".html" : "https://textpro.me/" + effect + ".html";
  try {
    if (text1) {
      result = await textpro(url, [text1, text2]);
    }
    let contextInfo = {} || {
      ...(await msg.bot.contextInfo("ᴛᴇxᴛ ᴛᴏ ʟᴏɢᴏ", "Hello " + msg.senderName))
    };
    return await msg.bot.sendMessage(msg.jid, {
      'image': {
        'url': result.image
      },
      'caption': caption,
      'contextInfo': contextInfo
    }, {
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    try {
      let apiUrl = global.api_smd + ("/api/maker?text1=" + text1 + '&text2=' + text2 + '&url=' + url);
      apiResult = await fetchJson(apiUrl);
      if ((!apiResult || !apiResult.status || !apiResult.img) && showError) {
        return msg.error(error + "\nWebinfo:" + (apiResult.img || apiResult) + "\n\nfileName: textToLogoGenerator->s.js", error);
      }
      await msg.bot.sendMessage(msg.jid, {
        'image': {
          'url': apiResult.img
        }
      }, {
        'messageId': msg.bot.messageId()
      });
    } catch (apiError) {
      let imageUrl = result && result.image ? result.image : apiResult && apiResult.img ? apiResult.img : false;
      if (showError) {
        msg.error(error + "\n\nAPI Error : " + apiError + "\n\nfileName: textToLogoGenerator->s.js", error, (imageUrl ? "Here we go\n\n" + imageUrl : "Error, Request Denied!").trim());
      }
    }
  }
}

async function photoEditor(msg, effect = 'ad', captionText = '', showError = true) {
  let imageTypes = ["imageMessage"];
  try {
    let mediaMessage = imageTypes.includes(msg.mtype) ? msg : msg.reply_message;
    if (!mediaMessage || !imageTypes.includes(mediaMessage?.['mtype'] || 'null')) {
      return await msg.send("*_Uhh Dear, Reply to an image_*");
    }
    let downloadedMedia = await msg.bot.downloadAndSaveMediaMessage(mediaMessage);
    let telegraphUrl = await TelegraPh(downloadedMedia);
    try {
      fs.unlinkSync(downloadedMedia);
    } catch (e) {}
    return await msg.bot.sendMessage(msg.chat, {
      'image': {
        'url': "https://api.popcat.xyz/" + effect + "?image=" + telegraphUrl
      },
      'caption': captionText
    }, {
      'quoted': msg,
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    if (showError) {
      await msg.error(error + "\n\ncommand: " + effect + "\nfileName: photoEditor->s.js", error);
    }
  }
}

async function plugins(msg, action, input = '', pluginPath = '') {
  let output = '';
  try {
    let botData = (await bot_.findOne({
      'id': 'bot_' + msg.user
    })) || (await bot_["new"]({
      'id': "bot_" + msg.user
    }));
    let pluginsData = botData.plugins;
    if (action.toLowerCase() === "install") {
      let installedPlugins = '';
      for (let url of isUrl(input)) {
        var parsedUrl = new URL(url.replace(/[_*]+$/, ''));
        parsedUrl = parsedUrl.href.includes("raw") ? parsedUrl.href : parsedUrl.href + "/raw";
        const {
          data: pluginCode
        } = await axios.get(parsedUrl);
        let commandMatch = /pattern: ["'](.*)["'],/g.exec(pluginCode) || /cmdname: ["'](.*)["'],/g.exec(pluginCode) || /name: ["'](.*)["'],/g.exec(pluginCode);
        if (!commandMatch) {
          output += "*gist not found:* _" + parsedUrl + "_ \n";
          continue;
        }
        let commandName = commandMatch[1].split(" ")[0] || Math.random().toString(36).slice(-5);
        let sanitizedName = commandName.replace(/[^A-Za-z]/g, '');
        if (installedPlugins.includes(sanitizedName)) {
          continue;
        } else {
          installedPlugins = installedPlugins + "[\"" + sanitizedName + "\"] ";
        }
        if (pluginsData[sanitizedName]) {
          output += "*Plugin _'" + sanitizedName + "'_ already installed!*\n";
          continue;
        }
        let filePath = pluginPath + '/' + sanitizedName + ".smd";
        await fs.writeFileSync(filePath, pluginCode, "utf8");
        try {
          require(filePath);
        } catch (requireError) {
          fs.unlinkSync(filePath);
          output += "*Invalid :* _" + parsedUrl + "_\n ```" + requireError + "```\n\n ";
          continue;
        }
        if (!pluginsData[sanitizedName]) {
          pluginsData[sanitizedName] = parsedUrl;
          await bot_.updateOne({
            'id': "bot_" + msg.user
          }, {
            'plugins': pluginsData
          });
          output += "*Plugin _'" + sanitizedName + "'_ Succesfully installed!*\n";
        }
      }
    } else {
      if (action.toLowerCase() === "remove") {
        if (input === "all") {
          let removedList = '';
          for (const pluginName in pluginsData) {
            try {
              fs.unlinkSync(pluginPath + '/' + pluginName + ".smd");
              removedList = '' + removedList + pluginName + ',';
            } catch (e) {
              console.log("❌ " + pluginName + " ❌ NOT BE REMOVED", e);
            }
          }
          await bot_.updateOne({
            'id': 'bot_' + msg.user
          }, {
            'plugins': {}
          });
          output = "*External plugins " + (removedList ? removedList : "all") + " removed!!!*";
        } else {
          try {
            if (pluginsData[input]) {
              try {
                fs.unlinkSync(pluginPath + '/' + input + ".smd");
              } catch {}
              delete pluginsData[input];
              await bot_.updateOne({
                'id': "bot_" + msg.user
              }, {
                'plugins': pluginsData
              });
              output += "*Plugin _'" + input + "'_ Succesfully removed!*";
            } else {
              output += "*_plugin not exist in " + Config.botname + '_*';
            }
          } catch (e) {
            console.log("Error while removing plugins \n ", e);
          }
        }
      } else {
        if (action.toLowerCase() === "plugins") {
          if (input) {
            output = pluginsData[input] ? '*_' + input + ":_* " + pluginsData[input] : false;
          } else {
            for (const pluginName in pluginsData) {
              output += '*' + (pluginName + 1) + ":* " + pluginName + " \n*Url:* " + pluginsData[pluginName] + "\n\n";
            }
          }
        }
      }
    }
    return output;
  } catch (error) {
    console.log("Plugins : ", error);
    return (output + " \n\nError: " + error).trim();
  }
}

async function updateProfilePicture(msg, jid, media, type = 'pp') {
  try {
    if (type === 'pp' || type === "gpp") {
      let savedMedia = await msg.bot.downloadAndSaveMediaMessage(media);
      await msg.bot.updateProfilePicture(jid, {
        'url': savedMedia
      });
    } else {
      async function cropImage(buffer) {
        const image = await Jimp.read(buffer);
        const width = image.getWidth();
        const height = image.getHeight();
        const cropped = image.crop(0, 0, width, height);
        return {
          'img': await cropped.scaleToFit(324, 720).getBufferAsync(Jimp.MIME_JPEG),
          'preview': await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG)
        };
      }
      try {
        const downloadedMedia = await media.download();
        const {
          query: queryFunc
        } = msg.bot;
        const {
          preview
        } = await cropImage(downloadedMedia);
        await queryFunc({
          'tag': 'iq',
          'attrs': {
            'to': jid,
            'type': "set",
            'xmlns': "w:profile:picture"
          },
          'content': [{
            'tag': "picture",
            'attrs': {
              'type': "image"
            },
            'content': preview
          }]
        });
      } catch (error) {
        let savedMedia = await msg.bot.downloadAndSaveMediaMessage(media);
        await msg.bot.updateProfilePicture(jid, {
          'url': savedMedia
        });
        return await msg.error(error + " \n\ncommand: update pp", error, false);
      }
    }
    return await msg.reply("*_Profile icon updated Succesfully!!_*");
  } catch (error) {
    return await msg.error(error + " \n\ncommand: " + (type ? type : 'pp'), error);
  }
}

async function forwardMessage(targetJid, msg, type = '') {
  let messageType = msg.quoted.mtype;
  let relayMessage;
  if (messageType === "videoMessage" && type === 'ptv') {
    relayMessage = {
      'ptvMessage': {
        ...msg.quoted
      }
    };
  } else {
    if (messageType === "videoMessage") {
      relayMessage = {
        'videoMessage': {
          ...msg.quoted
        }
      };
    } else {
      if (messageType === "imageMessage") {
        relayMessage = {
          'imageMessage': {
            ...msg.quoted
          }
        };
      } else {
        if (messageType === 'audioMessage') {
          relayMessage = {
            'audioMessage': {
              ...msg.quoted
            }
          };
        } else {
          if (messageType === 'documentMessage') {
            relayMessage = {
              'documentMessage': {
                ...msg.quoted
              }
            };
          } else {
            if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
              return await msg.send(msg.quoted.text, {}, '', msg, targetJid);
            }
          }
        }
      }
    }
  }
  if (relayMessage) {
    try {
      await empire.bot.relayMessage(targetJid, relayMessage, {
        'messageId': msg.key.id
      });
    } catch (error) {
      console.log("Error in " + type + "-cmd in forwardMessage \n", error);
      if (type === "ptv" || type === "save") {
        await msg.error(error);
      }
    }
  }
}

async function generateSticker(msg, stickerBuffer, packInfo = {
  'pack': Config.packname,
  'author': Config.author
}, showError = true) {
  try {
    let sticker = new Sticker(stickerBuffer, {
      ...packInfo
    });
    return await msg.bot.sendMessage(msg.chat, {
      'sticker': await sticker.toBuffer()
    }, {
      'quoted': msg,
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    if (showError) {
      await msg.error(error + "\n\nfileName: generateSticker->s.js\n");
    }
  }
}

async function getRandom(extension = ".jpg", max = 10000) {
  return '' + Math.floor(Math.random() * max) + extension;
}

async function randomeFunfacts(type) {
  try {
    if (type === "question") {
      return await random_question();
    } else {
      if (type === "truth") {
        return await truth();
      } else {
        if (type === 'dare') {
          return await dare();
        } else {
          if (type === 'joke') {
            const jokeData = await (await fetch("https://official-joke-api.appspot.com/random_joke")).json();
            return "*Joke :* " + jokeData.setup + "\n*Punchline:*  " + jokeData.punchline;
          } else {
            if (type === "joke2") {
              const jokeData = await (await fetch('https://v2.jokeapi.dev/joke/Any?type=single')).json();
              return "*joke :* " + jokeData.joke;
            } else {
              if (type === 'fact') {
                const {
                  data: factData
                } = await axios.get("https://nekos.life/api/v2/fact");
                return "*Fact:* " + factData.fact;
              } else {
                if (type === "quotes") {
                  const {
                    data: quoteData
                  } = await axios.get("https://favqs.com/api/qotd");
                  return "╔════◇\n║ *🎗️Content:* " + quoteData.quote.body + "\n║ *👤Author:* " + quoteData.quote.author + "\n║\n╚════════════╝";
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    msg.error(error);
    console.log("./lib/Empire.js/randomeFunfacts()\n", error);
  }
}

async function audioEditor(msg, effect = "bass", additionalParam = '') {
  if (!msg.quoted) {
    return await msg.send("*_Uhh Dear, Reply to audio!!!_*");
  }
  let messageType = msg.quoted.mtype || msg.mtype;
  if (!/audio/.test(messageType)) {
    return await msg.send("*_Reply to the audio you want to change with_*", {}, '', additionalParam);
  }
  try {
    let ffmpegFilter = "-af equalizer=f=54:width_type=o:width=2:g=20";
    if (/bass/.test(effect)) {
      ffmpegFilter = "-af equalizer=f=54:width_type=o:width=2:g=20";
    }
    if (/blown/.test(effect)) {
      ffmpegFilter = "-af acrusher=.1:1:64:0:log";
    }
    if (/deep/.test(effect)) {
      ffmpegFilter = "-af atempo=4/4,asetrate=44500*2/3";
    }
    if (/earrape/.test(effect)) {
      ffmpegFilter = "-af volume=12";
    }
    if (/fast/.test(effect)) {
      ffmpegFilter = "-filter:a \"atempo=1.63,asetrate=44100\"";
    }
    if (/fat/.test(effect)) {
      ffmpegFilter = "-filter:a \"atempo=1.6,asetrate=22100\"";
    }
    if (/nightcore/.test(effect)) {
      ffmpegFilter = "-filter:a atempo=1.06,asetrate=44100*1.25";
    }
    if (/reverse/.test(effect)) {
      ffmpegFilter = "-filter_complex \"areverse\"";
    }
    if (/robot/.test(effect)) {
      ffmpegFilter = "-filter_complex \"afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75\"";
    }
    if (/slow/.test(effect)) {
      ffmpegFilter = "-filter:a \"atempo=0.7,asetrate=44100\"";
    }
    if (/smooth/.test(effect)) {
      ffmpegFilter = "-filter:v \"minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120'\"";
    }
    if (/tupai/.test(effect)) {
      ffmpegFilter = "-filter:a \"atempo=0.5,asetrate=65100\"";
    }
    let downloadedAudio = await msg.bot.downloadAndSaveMediaMessage(msg.quoted);
    let outputPath = 'temp/' + (msg.sender.slice(0, 6) + effect) + ".mp3";
    exec("ffmpeg -i " + downloadedAudio + " " + ffmpegFilter + " " + outputPath, async (error, stdout, stderr) => {
      try {
        fs.unlinkSync(downloadedAudio);
      } catch {}
      if (error) {
        return msg.error(error);
      } else {
        let audioBuffer = fs.readFileSync(outputPath);
        try {
          fs.unlinkSync(outputPath);
        } catch {}
        var contextInfo = {
          ...(await msg.bot.contextInfo("Hellow " + msg.senderName + " 🤍", "⇆ㅤ ||◁ㅤ❚❚ㅤ▷||ㅤ ⇆"))
        };
        return msg.bot.sendMessage(msg.chat, {
          'audio': audioBuffer,
          'mimetype': "audio/mpeg",
          'ptt': !!/ptt|voice/.test(msg.test || ''),
          'contextInfo': contextInfo
        }, {
          'quoted': msg,
          'messageId': msg.bot.messageId()
        });
      }
    });
  } catch (error) {
    await msg.error(error + "\n\ncmdName : " + effect + "\n");
    return console.log("./lib/Empire.js/audioEditor()\n", error);
  }
}

async function send(msg, content, options = {
  'packname': '',
  'author': "Empire-Md"
}, param1 = '', param2 = '', targetJid = '') {
  if (!content || !msg) {
    return;
  }
  try {
    let destination = targetJid ? targetJid : msg.chat;
    return await msg.send(content, options, param1, param2, destination);
  } catch (error) {
    console.log("./lib/Empire.js/send()\n", error);
  }
}

async function react(msg, reactionText, quotedMsg = '') {
  try {
    if (!reactionText || !msg) {
      return;
    }
    let targetKey = quotedMsg && quotedMsg.key ? quotedMsg.key : msg.key;
    return await msg.bot.sendMessage(msg.chat, {
      'react': {
        'text': reactionText,
        'key': targetKey
      }
    }, {
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    console.log("./lib/Empire.js/react()\n", error);
  }
}

let note = {
  info: "make sure to provide 1st parameter of bot number as {user:botNumber} ,and 2nd as note text|id",
  "addnote": async (botInfo, noteText) => {
    try {
      let botData = (await bot_.findOne({
        'id': "bot_" + botInfo.user
      })) || (await bot_['new']({
        'id': "bot_" + botInfo.user
      }));
      let notes = botData.notes;
      let index = 0;
      while (notes[index] !== undefined) {
        index++;
      }
      notes[index] = noteText;
      await bot_.updateOne({
        'id': "bot_" + botInfo.user
      }, {
        'notes': notes
      });
      return {
        'status': true,
        'id': index,
        'msg': "*New note added at ID: " + index + '*'
      };
    } catch (error) {
      console.log("note.addnote ERROR :  ", error);
      return {
        'status': false,
        'error': error,
        'msg': "*Can't add new notes due to error!!*"
      };
    }
  },
  "delnote": async (botInfo, noteId) => {
    try {
      let botData = (await bot_.findOne({
        'id': "bot_" + botInfo.user
      })) || (await bot_["new"]({
        'id': "bot_" + botInfo.user
      }));
      let notes = botData.notes;
      let responseMessage = "*Please provide valid note id!*";
      if (notes[noteId]) {
        delete notes[noteId];
        await bot_.updateOne({
          'id': 'bot_' + botInfo.user
        }, {
          'notes': notes
        });
        responseMessage = "*Note with Id:" + noteId + " deleted successfully!*";
      }
      return {
        'status': true,
        'msg': responseMessage
      };
    } catch (error) {
      console.log("note.delnote  ERROR :  ", error);
      return {
        'status': false,
        'error': error,
        'msg': "*Can't delete notes due to error!!*"
      };
    }
  },
  "delallnote": async (botInfo, param = '') => {
    try {
      await bot_.updateOne({
        'id': "bot_" + botInfo.user
      }, {
        'notes': {}
      });
      return {
        'status': true,
        'msg': "*All saved notes deleted from server!*"
      };
    } catch (error) {
      console.log("note.delnote  ERROR :  ", error);
      return {
        'status': false,
        'error': error,
        'msg': "*Request not be proceed, Sorry!*"
      };
    }
  },
  "allnotes": async (botInfo, noteId = '') => {
    try {
      let botData = (await bot_.findOne({
        'id': "bot_" + botInfo.user
      })) || (await bot_["new"]({
        'id': "bot_" + botInfo.user
      }));
      let notes = botData.notes;
      let responseMessage = "*Please provide valid note id!*";
      if (noteId == "all" || !noteId) {
        let notesList = '';
        for (const id in notes) {
          notesList += "*NOTE " + id + ":* " + notes[id] + "\n\n";
        }
        responseMessage = notesList ? notesList : "*No notes found!*";
      } else if (noteId && notes[noteId]) {
        responseMessage = "*Note " + noteId + ":* " + notes[noteId];
      }
      return {
        'status': true,
        'msg': responseMessage
      };
    } catch (error) {
      console.log("note.delnote  ERROR :  ", error);
      return {
        'status': false,
        'error': error,
        'msg': "*Can't delete notes due to error!!*"
      };
    }
  }
};

async function sendWelcome(msg, text = '', replyJid = '', mentions = '', type = "msg", contextInfo = false) {
  try {
    if (!global.SmdOfficial) {
      return "Get Ouut";
    }
    if (text) {
      if (msg.isGroup) {
        text = text.replace(/@gname|&gname/gi, msg.metadata.subject).replace(/@desc|&desc/gi, msg.metadata.desc).replace(/@count|&count/gi, msg.metadata.participants.length);
      }
      let processedText = text.replace(/@user|&user/gi, '@' + msg.senderNum).replace(/@name|&name/gi, msg.senderName || '_').replace(/@gname|&gname/gi, '').replace(/@desc|&desc/gi, '').replace(/@count|&count/gi, '1').replace(/@pp|&pp|@gpp|&gpp|@context|&context/g, '').replace(/@time|&time/gi, msg.time).replace(/@date|&date/gi, msg.date).replace(/@bot|&bot/gi, '' + Config.botname).replace(/@owner|&owner/gi, '' + Config.ownername).replace(/@caption|&caption/gi, caption).replace(/@gurl|@website|&gurl|&website|@link|&link/gi, gurl).replace(/@telegram|&telegram/gi, global.telegram || 'https://t.me/empire_md0').replace(/@runtime|&runtime|@uptime|&uptime/gi, '' + runtime(process.uptime())).trim();
      try {
        processedText = processedText.replace(/@line|&line/gi, (await fetchJson("https://api.popcat.xyz/pickuplines")).pickupline || '');
      } catch (e) {
        processedText = processedText.replace(/@line|&line/gi, '');
      }
      try {
        if (/@quote|&quote/gi.test(processedText)) {
          let {
            data: quoteData
          } = await axios.get('https://favqs.com/api/qotd');
          if (quoteData && quoteData.quote) {
            processedText = processedText.replace(/@quote|&quote/gi, quoteData.quote.body || '').replace(/@author|&author/gi, quoteData.quote.author || '');
          }
        }
      } catch (e) {
        processedText = processedText.replace(/@quote|&quote|@author|&author/gi, '');
      }
      if (!type || type === "msg") {
        try {
          if (typeof mentions === "string") {
            mentions = mentions.split(',');
          }
          if (/@user|&user/g.test(text) && !mentions.includes(msg.sender)) {
            mentions.push(msg.sender);
          }
        } catch (e) {
          console.log("ERROR : ", e);
        }
        var contextObj = {
          ...(contextInfo || /@context|&context/g.test(text) ? await msg.bot.contextInfo(Config.botname, msg.pushName) : {}),
          'mentionedJid': mentions
        };
        if (/@pp/g.test(text)) {
          return await msg.send(await msg.getpp(), {
            'caption': processedText,
            'mentions': mentions,
            'contextInfo': contextObj
          }, "image", replyJid);
        } else {
          return msg.jid && /@gpp/g.test(text) ? await msg.send(await msg.getpp(msg.jid), {
            'caption': processedText,
            'mentions': mentions,
            'contextInfo': contextObj
          }, "image", replyJid) : await msg.send(processedText, {
            'mentions': mentions,
            'contextInfo': contextObj
          }, "empire", replyJid);
        }
      } else {
        return processedText;
      }
    }
  } catch (error) {
    console.log("./lib/Empire.js/sendWelcome()\n", error);
  }
}

async function aitts(msg, text = '', showError = true) {
  try {
    if (!global.SmdOfficial || global.SmdOfficial !== "yes") {
      return "u bloody, Get out from here!!";
    }
    if (!ELEVENLAB_API_KEY || !ELEVENLAB_API_KEY.length > 8) {
      return msg.reply("Dear, You Dont Have ELEVENLAB_API_KEY \nCreate ELEVENLAB KEY from below Link \nhttps://elevenlabs.io/\n\nAnd Set it in ELEVENLAB_API_KEY Var\n\n" + caption);
    }
    const voiceIds = ["21m00Tcm4TlvDq8ikWAM", '2EiwWnXFnvU5JabPnv8n', "AZnzlk1XvdvUeBnXmlld", "CYw3kZ02Hs0563khs1Fj", "D38z5RcWu1voky8WS1ja", "EXAVITQu4vr4xnSDxMaL", "ErXwobaYiN019PkySvjV", "GBv7mTt0atIp3Br8iCZE", 'IKne3meq5aSn9XLyUdCD', "LcfcDJNUP1GQjkzn1xUU", "MF3mGyEYCl7XYWbV9V6O", "N2lVS1w4EtoT3dr4eOWO", 'ODq5zmih8GrVes37Dizd', 'SOYHLrjzK2X1ezoPC6cr', "TX3LPaxmHKxFdv7VOQHJ", "ThT5KcBeYPX3keUQqHPh", "TxGEqnHWrfWFTfGW9jXj", "VR6AewLTigWG4xSOukaG", 'XB0fDUnXU5powFXDhCwa', 'XrExE9yKIg1WjnnlVkGX', "Yko7PKHZNXotIFUBG7I9", "ZQe5CZNOzWyzPSCn5a3c", "Zlb1dXrM653N07WRdFW3", "bVMeCyTHy58xNoL34h3p", "flq6f7yk4E4fJM5XTYuZ", "g5CIjZEefAph4nQFvHAz", "jBpfuIE2acCO8z3wKNLl", "jsCqWAovK2LkecY7zXl4", "oWAxZDx7w5VEj9dCyTzz", "onwK4e9ZLuTAKqWW03F9", "pMsXgVXv3BLzUgSXRplE", "pNInz6obpgDQGcFmaJgB", "piTKgcLEGmPE4e6mEKli", "t0jbNlBVZ17f02VDIeMI", "wViXBPUzp2ZZixB1xQuM", 'yoZ06aMxZJJ28mfd3POQ', "z9fAnlkpzviPz146aGWa", "zcAOhNBS3c14rBihAFp1", 'zrHiDhphv9ZnVXBqCLjz'];
    const voiceIdIndex = parseInt(aitts_Voice_Id);
    if (!text && !msg.isCreator) {
      return msg.reply("*Uhh Dear, Please Provide text..!*\n*Example: _.aitts i am " + msg.pushName + "._*");
    } else {
      if (!text && msg.isCreator || text === 'setting' || text === "info") {
        return msg.bot.sendMessage(msg.jid, {
          'text': "*Hey " + msg.pushName + "!.*\n  _Please provide text!_\n  *Example:* _.aitts i am " + msg.pushName + "._\n\n  *You Currently " + (!isNaN(voiceIdIndex) && voiceIdIndex > 0 && voiceIdIndex <= 39 ? "set Voice Id: " + voiceIdIndex + "*\nUpdate" : "not set any Specific Voice*\nAdd Specific") + " Voice: _.addvar AITTS_ID:35/4/32,etc._\n\n\n  *Also use available voices*" + '```' + "\n\n  1: Rachel\n  2: Clyde\n  3: Domi\n  4: Dave\n  5: Fin\n  6: Bella\n  7: Antoni\n  8: Thomas\n  9: Charlie\n  10: Emily\n  11: Elli\n  12: Callum\n  13: Patrick\n  14: Harry\n  15: Liam\n  16: Dorothy\n  17: Josh\n  18: Arnold\n  19: Charlotte\n  20: Matilda\n  21: Matthew\n  22: James\n  23: Joseph\n  24: Jeremy\n  25: Michael\n  26: Ethan\n  27: Gigi\n  28: Freya\n  29: Grace\n  30: Daniel\n  31: Serena\n  32: Adam\n  33: Nicole\n  34: Jessie\n  35: Ryan\n  36: empire\n  37: Glinda\n  38: Giovanni\n  39: Mimi\n  " + "```" + ("\n\n  *Example:* _.aitts i am " + msg.pushName + "_:36 \n  *OR:* _.aitts i am " + msg.pushName + "_:empire     \n\n\n  " + caption).trim()
        }, {
          'messageId': msg.bot.messageId()
        });
      }
    }
    let processedText = text;
    var voiceIndex = 0 || Math.floor(Math.random() * voiceIds.length);
    let hasSpecificVoice = false;
    if (!isNaN(voiceIdIndex) && voiceIdIndex > 0 && voiceIdIndex < 39) {
      hasSpecificVoice = true;
      voiceIndex = voiceIdIndex;
    }
    if (text && text.includes(':')) {
      let parts = text.split(':');
      let voiceSpecifier = parts[parts.length - 1].trim() || '';
      processedText = parts.slice(0, parts.length - 1).join(':');
      if (voiceSpecifier.toLowerCase() === "richel" || voiceSpecifier === '1') {
        voiceIndex = 0;
      } else {
        if (voiceSpecifier.toLowerCase() === "clyde" || voiceSpecifier === '2') {
          voiceIndex = 1;
        } else {
          if (voiceSpecifier.toLowerCase() === "domi" || voiceSpecifier === '3') {
            voiceIndex = 2;
          } else {
            if (voiceSpecifier.toLowerCase() === "dave" || voiceSpecifier === '4') {
              voiceIndex = 3;
            } else {
              if (voiceSpecifier.toLowerCase() === 'fin' || voiceSpecifier === '5') {
                voiceIndex = 4;
              } else {
                if (voiceSpecifier.toLowerCase() === "bella" || voiceSpecifier === '6') {
                  voiceIndex = 5;
                } else {
                  if (voiceSpecifier.toLowerCase() === 'antoni' || voiceSpecifier === '7') {
                    voiceIndex = 6;
                  } else {
                    if (voiceSpecifier.toLowerCase() === 'thomas' || voiceSpecifier === '8') {
                      voiceIndex = 7;
                    } else {
                      if (voiceSpecifier.toLowerCase() === 'charlie' || voiceSpecifier === '9') {
                        voiceIndex = 8;
                      } else {
                        if (voiceSpecifier.toLowerCase() === "emily" || voiceSpecifier === '10') {
                          voiceIndex = 9;
                        } else {
                          if (voiceSpecifier.toLowerCase() === "elli" || voiceSpecifier === '11') {
                            voiceIndex = 10;
                          } else {
                            if (voiceSpecifier.toLowerCase() === "callum" || voiceSpecifier === '12') {
                              voiceIndex = 11;
                            } else {
                              if (voiceSpecifier.toLowerCase() === "patrick" || voiceSpecifier === '13') {
                                voiceIndex = 12;
                              } else {
                                if (voiceSpecifier.toLowerCase() === "harry" || voiceSpecifier === '14') {
                                  voiceIndex = 13;
                                } else {
                                  if (voiceSpecifier.toLowerCase() === "liam" || voiceSpecifier === '15') {
                                    voiceIndex = 14;
                                  } else {
                                    if (voiceSpecifier.toLowerCase() === "dorothy" || voiceSpecifier === '16') {
                                      voiceIndex = 15;
                                    } else {
                                      if (voiceSpecifier.toLowerCase() === "josh" || voiceSpecifier === '17') {
                                        voiceIndex = 16;
                                      } else {
                                        if (voiceSpecifier.toLowerCase() === "arnold" || voiceSpecifier === '18') {
                                          voiceIndex = 17;
                                        } else {
                                          if (voiceSpecifier.toLowerCase() === 'charlotte' || voiceSpecifier === '19') {
                                            voiceIndex = 18;
                                          } else {
                                            if (voiceSpecifier.toLowerCase() === "matilda" || voiceSpecifier === '20') {
                                              voiceIndex = 19;
                                            } else {
                                              if (voiceSpecifier.toLowerCase() === "matthew" || voiceSpecifier === '21') {
                                                voiceIndex = 20;
                                              } else {
                                                if (voiceSpecifier.toLowerCase() === 'james' || voiceSpecifier === '22') {
                                                  voiceIndex = 21;
                                                } else {
                                                  if (voiceSpecifier.toLowerCase() === "joseph" || voiceSpecifier === '23') {
                                                    voiceIndex = 22;
                                                  } else {
                                                    if (voiceSpecifier.toLowerCase() === "jeremy" || voiceSpecifier === '24') {
                                                      voiceIndex = 23;
                                                    } else {
                                                      if (voiceSpecifier.toLowerCase() === "michael" || voiceSpecifier === '25') {
                                                        voiceIndex = 24;
                                                      } else {
                                                        if (voiceSpecifier.toLowerCase() === "ethan" || voiceSpecifier === '26') {
                                                          voiceIndex = 25;
                                                        } else {
                                                          if (voiceSpecifier.toLowerCase() === "gigi" || voiceSpecifier === '27') {
                                                            voiceIndex = 26;
                                                          } else {
                                                            if (voiceSpecifier.toLowerCase() === "freya" || voiceSpecifier === '28') {
                                                              voiceIndex = 27;
                                                            } else {
                                                              if (voiceSpecifier.toLowerCase() === 'grace' || voiceSpecifier === '29') {
                                                                voiceIndex = 28;
                                                              } else {
                                                                if (voiceSpecifier.toLowerCase() === 'daniel' || voiceSpecifier === '30') {
                                                                  voiceIndex = 29;
                                                                } else {
                                                                  if (voiceSpecifier.toLowerCase() === "serena" || voiceSpecifier === '31') {
                                                                    voiceIndex = 30;
                                                                  } else {
                                                                    if (voiceSpecifier.toLowerCase() === "adam" || voiceSpecifier === '32') {
                                                                      voiceIndex = 31;
                                                                    } else {
                                                                      if (voiceSpecifier.toLowerCase() === "nicole" || voiceSpecifier === '33') {
                                                                        voiceIndex = 32;
                                                                      } else {
                                                                        if (voiceSpecifier.toLowerCase() === "jessie" || voiceSpecifier === '34') {
                                                                          voiceIndex = 33;
                                                                        } else {
                                                                          if (voiceSpecifier.toLowerCase() === "ryan" || voiceSpecifier === '35') {
                                                                            voiceIndex = 34;
                                                                          } else {
                                                                            if (voiceSpecifier.toLowerCase() === "empire" || voiceSpecifier === '36') {
                                                                              voiceIndex = 35;
                                                                            } else {
                                                                              if (voiceSpecifier.toLowerCase() === "glinda" || voiceSpecifier === '37') {
                                                                                voiceIndex = 36;
                                                                              } else {
                                                                                if (voiceSpecifier.toLowerCase() === 'giovanni' || voiceSpecifier === '38') {
                                                                                  voiceIndex = 37;
                                                                                } else if (voiceSpecifier.toLowerCase() === "mimi" || voiceSpecifier === '39') {
                                                                                  voiceIndex = 38;
                                                                                } else {
                                                                                  processedText = text;
                                                                                  voiceIndex = voiceIndex;
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const requestConfig = {
      'method': "POST",
      'url': "https://api.elevenlabs.io/v1/text-to-speech/" + voiceIds[voiceIndex],
      'headers': {
        'accept': "audio/mpeg",
        'content-type': 'application/json',
        'xi-api-key': '' + ELEVENLAB_API_KEY
      },
      'data': {
        'text': processedText
      },
      'responseType': "arraybuffer"
    };
    const {
      data: audioData
    } = await axios.request(requestConfig);
    if (!audioData) {
      return await msg.send("*_Request not be proceed!_*");
    }
    await msg.sendMessage(msg.from, {
      'audio': audioData,
      'mimetype': 'audio/mpeg',
      'ptt': true
    }, {
      'quoted': msg,
      'messageId': msg.bot.messageId()
    });
  } catch (error) {
    if (showError) {
      await msg.error(error + "\n\ncommand: aitts", error);
    }
  }
}

let setMention = {
  "mention": false
};

setMention.status = async (msg, enable = false) => {
  try {
    setMention.mention = false;
    let botData = (await bot_.findOne({
      'id': "bot_" + msg.user
    })) || (await bot_["new"]({
      'id': 'bot_' + msg.user
    }));
    let mentionData = botData.mention || {};
    if (enable) {
      if (mentionData.status) {
        return await msg.reply("_Mention Already Enabled!_");
      }
      mentionData.status = true;
      await bot_.updateOne({
        'id': "bot_" + msg.user
      }, {
        'mention': mentionData
      });
      return await msg.reply("_Mention Enabled!_");
    } else {
      if (!mentionData.status) {
        return await msg.reply("_Mention Already Disabled!_");
      }
      mentionData.status = false;
      await bot_.updateOne({
        'id': "bot_" + msg.user
      }, {
        'mention': mentionData
      });
      return await msg.reply("_Mention Disabled!_");
    }
  } catch (error) {
    msg.error(error + "\n\nCommand: mention", error, false);
  }
};

setMention.get = async msg => {
  try {
    let botData = (await bot_.findOne({
      'id': "bot_" + msg.user
    })) || (await bot_["new"]({
      'id': "bot_" + msg.user
    }));
    let mentionData = botData.mention || {};
    if (mentionData.get) {
      return await msg.reply("*Status :* " + (mentionData.status ? 'ON' : "OFF") + "\nUse on/off/get/test to enable and disable mention\n\n*Mention Info:* " + mentionData.get);
    } else {
      return await msg.reply("*You did'nt set mention message yet!*\n*please Check: https://github.com/efeurhobo/Empire-Md/wiki/mention*");
    }
  } catch (error) {
    msg.error(error + "\n\nCommand: mention", error, false);
  }
};

setMention.typesArray = text => {
  try {
    const lines = text.split("\n");
    let result = {
      'text': []
    };
    let contentTypes = ["gif", 'video', "audio", 'image', 'sticker'];
    let currentType = null;
    for (const line of lines) {
      const words = line.split(" ");
      if (words.length >= 1) {
        const typeIndex = words.findIndex(word => word.startsWith("type/"));
        if (typeIndex !== -1) {
          currentType = words[typeIndex].slice(5).toLowerCase();
          let isGeneralType = /empire|smd|message|chat/gi.test(currentType);
          if (!result[isGeneralType ? "empire" : currentType]) {
            result[isGeneralType ? "empire" : currentType] = [];
          }
        }
        const filteredWords = words.filter(word => word !== "type/" + currentType && word !== '');
        currentType = /empire|smd|message|chat/gi.test(currentType) ? "empire" : currentType;
        if (filteredWords.length > 0) {
          if (contentTypes.includes(currentType)) {
            filteredWords.forEach(word => {
              if (/http/gi.test(word)) {
                result[currentType].push(word);
              }
            });
          } else if (/react/gi.test(currentType)) {
            result.react.push(...filteredWords);
          } else {
            result[/empire/gi.test(currentType) ? 'empire' : 'text'].push(filteredWords.join(" "));
          }
        }
      }
      currentType = null;
    }
    return result || {};
  } catch (error) {
    console.log("Error in Mention typesArray\n", error);
  }
};

setMention.update = async (msg, mentionText) => {
  try {
    setMention.mention = false;
    let mentionData = {
      "status": true,
      "get": mentionText
    };
    try {
      const jsonMatch = mentionText.match(/\{.*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const jsonData = JSON.parse(jsonString);
        mentionData.json = jsonData;
        mentionText = mentionText.replace(/\{.*\}/, '');
      }
    } catch (jsonError) {
      console.log("ERROR mention JSON parse", jsonError);
    }
    mentionData.text = mentionText;
    mentionData.type = setMention.typesArray(mentionText) || {};
    await bot_.updateOne({
      'id': "bot_" + msg.user
    }, {
      'mention': mentionData
    });
    return await msg.send("*Mention updated!*", {
      'mentios': [msg.user]
    });
  } catch (error) {
    msg.error(error + "\n\nCommand: mention", error, false);
  }
};

setMention.cmd = async (msg, action = '') => {
  try {
    let mentionData = false || false;
    if (!mentionData) {
      let botData = (await bot_.findOne({
        'id': "bot_" + msg.user
      })) || (await bot_["new"]({
        'id': "bot_" + msg.user
      }));
      mentionData = botData.mention || false;
      setMention.mention = mentionData;
    }
    if (global.SmdOfficial !== "yes") {
      return;
    }
    if (action === 'get' || action === "info" || !action && mentionData.status && mentionData.get) {
      setMention.get(msg);
    } else {
      if (!action) {
        msg.reply("_Read wiki to set mention message https://github.com/efeurhobobullish/Empire-Md/wiki/mention_", {}, 'smd');
      } else {
        if (['off', "deact", 'disable', "false"].includes(action.toLowerCase() || action)) {
          setMention.status(msg, false);
        } else {
          if (['on', 'act', "enable", 'true', "active"].includes(action.toLowerCase() || action)) {
            setMention.status(msg, true);
          } else {
            if (["check", "test", 'me'].includes(action.toLowerCase() || action)) {
              setMention.check(msg, action, true);
            } else {
              setMention.update(msg, action);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("ERROR IN MENTION CMD \n ", error);
  }
};

setMention.randome = types => {
  try {
    const typeKeys = Object.keys(types || {});
    if (typeKeys.length > 1) {
      const randomType = typeKeys[Math.floor(Math.random() * (typeKeys.length - 1)) + 1];
      const items = types[randomType];
      if (items && items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        return {
          'type': randomType,
          'url': items[randomIndex]
        };
      }
    }
    return types && types.text ? {
      'url': types.text.join(" ") || '',
      'type': "smd"
    } : undefined;
  } catch (error) {
    console.log(error);
  }
};

global.mentionempire = process.env.MENTIONEMPIRE || true;

setMention.check = async (msg, text = '', forceCheck = false) => {
  try {
    const isMentioned = forceCheck || msg.mentionedJid.includes(msg.user) || text.includes('@' + msg.user.split('@')[0]) || global.mentionempire && (msg.mentionedJid.includes("@2348078582627@s.whatsapp.net") || msg.mentionedJid.includes("@2348144250768@s.whatsapp.net") || /@2348078582627|@2348144250768/g.test(text));
    if (isMentioned) {
      if (global.SmdOfficial !== "yes") {
        return;
      }
      let mentionConfig = false || false;
      if (!mentionConfig) {
        let botData = (await bot_.findOne({
          'id': "bot_" + msg.user
        })) || (await bot_["new"]({
          'id': 'bot_' + msg.user
        }));
        mentionConfig = botData.mention || false;
        setMention.mention = mentionConfig;
      }
      if (typeof mentionConfig !== "object" || !mentionConfig || !mentionConfig.status) {
        return;
      }
      const randomContent = setMention.randome(mentionConfig.type);
      if (randomContent) {
        let messageType = randomContent.type;
        const additionalOptions = {};
        if (randomContent.type === "gif") {
          messageType = 'video';
          additionalOptions = {
            'gifPlayback': true
          };
        }
        try {
          const options = {
            ...mentionConfig.json,
            ...additionalOptions
          };
          if (options.contextInfo && options.contextInfo.externalAdReply && options.contextInfo.externalAdReply.thumbnail) {
            options.contextInfo.externalAdReply.thumbnail = (await getBuffer(options.contextInfo.externalAdReply.thumbnail)) || log0;
          }
          await msg.send(randomContent.url, options, messageType, msg);
        } catch (error) {
          console.log("Error Sending ContextInfo in mention ", error);
          try {
            msg.send(randomContent.url, {
              ...additionalOptions
            }, messageType, msg);
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.log("Error in Mention Check\n", error);
  }
};

let setFilter = {
  "filter": false
};

setFilter.set = async (msg, filterText = '') => {
  try {
    if (!filterText) {
      return msg.send("*Use " + prefix + "filter word:reply_text!*");
    }
    let [word, reply] = filterText.split(':').map(item => item.trim());
    if (!word || !reply) {
      return msg.send("*Use " + prefix + "filter " + (word || 'word') + ": " + (reply || "reply_text") + '!*');
    }
    let botData = (await bot_.findOne({
      'id': "bot_" + msg.user
    })) || (await bot_['new']({
      'id': "bot_" + msg.user
    }));
    let filters = botData.filter || {};
    filters[word] = reply;
    setFilter.filter = filters;
    msg.send("*Successfully set filter to '" + word + "'!*");
  } catch (error) {
    msg.error(error + "\n\nCommand:filter", error, "_Can't set filter!_");
  }
};

setFilter.stop = async (msg, word = '') => {
  try {
    if (!word) {
      return msg.send("*Provide a word that set in filter!*\n*Use " + prefix + "flist to get list of filtered words!*");
    }
    let botData = (await bot_.findOne({
      'id': "bot_" + msg.user
    })) || (await bot_["new"]({
      'id': "bot_" + msg.user
    }));
    let filters = botData.filter || {};
    if (!filters[word]) {
      return msg.reply("*Given Word ('" + word + "') not set to any filter!*");
    }
    delete filters[word];
    setFilter.filter = filters;
    await bot_.updateOne({
      'id': "bot_" + msg.user
    }, {
      'filter': filters
    });
    msg.reply("*_Filter word '" + word + "' deleted!_*");
  } catch (error) {
    msg.error(error + "\n\nCommand:fstop", error, "*Can't delete filter!*");
  }
};

setFilter.list = async (msg, param = '') => {
  try {
    let botData = (await bot_.findOne({
      'id': "bot_" + msg.user
    })) || (await bot_["new"]({
      'id': "bot_" + msg.user
    }));
    let filters = botData.filter || {};
    let filterList = Object.entries(filters).map(([key, value]) => key + " : " + value).join("\n");
    if (botData.filter && filterList) {
      msg.reply("*[LIST OF FILTERED WORDS]*\n\n" + filterList);
    } else {
      msg.reply("*_You didn't set any filter!_*");
    }
  } catch (error) {
    msg.error(error + "\n\nCommand:flist", error, false);
  }
};

setFilter.check = async (msg, word = '') => {
  try {
    let filters = false || false;
    if (!filters) {
      let botData = (await bot_.findOne({
        'id': "bot_" + msg.user
      })) || (await bot_["new"]({
        'id': "bot_" + msg.user
      }));
      filters = botData.filter || {};
      setFilter.filter = botData.filter || {};
    }
    if (filters[word]) {
      msg.reply(filters[word], {}, "smd", msg);
    }
  } catch (error) {
    console.log(error);
  }
};

process.env.name = process.env.name || "empire";

module.exports = {
  'sendAnimeReaction': sendAnimeReaction,
  'sendGImages': sendGImages,
  'AudioToBlackVideo': AudioToBlackVideo,
  'textToLogoGenerator': textToLogoGenerator,
  'photoEditor': photoEditor,
  'updateProfilePicture': updateProfilePicture,
  'randomeFunfacts': randomeFunfacts,
  'plugins': plugins,
  'getRandom': getRandom,
  'generateSticker': generateSticker,
  'forwardMessage': forwardMessage,
  'audioEditor': audioEditor,
  'send': send,
  'react': react,
  'note': note,
  'sendWelcome': sendWelcome,
  'aitts': aitts,
  'mention': setMention,
  'filter': setFilter
};