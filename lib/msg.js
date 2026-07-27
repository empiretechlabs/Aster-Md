const { proto, delay, getContentType } = require("@itsliaaa/baileys");
const fs = require("fs-extra");
const { unlink } = require('fs').promises;
const axios = require("axios");
const { writeExifWebp } = require("./sticker");
const moment = require('moment-timezone');
const { sizeFormatter } = require("human-readable");
const Config = require('../config');
const util = require("util");
const child_process = require("child_process");
const { tlang, langText } = require("./helpers");

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
exports.unixTimestampSeconds = unixTimestampSeconds;

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};
exports.sleep = sleep;
exports.delay = sleep;

function getResponseBody(message = {}, msg = {}, mtype = '') {
  if (mtype === 'buttonsResponseMessage') {
    return msg.selectedButtonId || msg.selectedDisplayText || '';
  }
  if (mtype === 'listResponseMessage') {
    return msg.singleSelectReply?.selectedRowId || msg.description || msg.title || '';
  }
  if (mtype === 'templateButtonReplyMessage') {
    return msg.selectedId || msg.selectedDisplayText || '';
  }
  if (mtype === 'interactiveResponseMessage') {
    try {
      const paramsJson = msg.nativeFlowResponseMessage?.paramsJson;
      if (paramsJson) {
        const parsed = JSON.parse(paramsJson);
        return parsed.id || parsed.description || paramsJson;
      }
    } catch {}
    return msg.body?.text || '';
  }

  return msg.text ||
    msg.conversation ||
    msg.caption ||
    message.conversation ||
    msg.selectedButtonId ||
    msg.singleSelectReply?.selectedRowId ||
    msg.selectedId ||
    msg.contentText ||
    msg.selectedDisplayText ||
    msg.title ||
    msg.name ||
    '';
}

const isUrl = url => {
  return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};
exports.isUrl = isUrl;

exports.generateMessageTag = tag => {
  0;
  let timestamp = exports.unixTimestampSeconds().toString();
  if (tag) {
    timestamp += ".--" + tag;
  }
  return timestamp;
};

exports.processTime = (startTime, endTime) => {
  return moment.duration(endTime - moment(startTime * 1000)).asSeconds();
};

const getBuffer = async (input, options = {}, method = "get") => {
  try {
    if (Buffer.isBuffer(input)) {
      return input;
    }
    if (/http/gi.test(input)) {
      const response = await axios({
        'method': method,
        'url': input,
        'headers': {
          'DNT': 1,
          'Upgrade-Insecure-Request': 1
        },
        ...options,
        'responseType': "arraybuffer"
      });
      return response.data;
    } else {
      if (fs.existsSync(input)) {
        return fs.readFileSync(input);
      } else {
        return input;
      }
    }
  } catch (error) {
    console.log("error while getting data in buffer : ", error);
    return false;
  }
};
exports.getBuffer = getBuffer;
exports.smdBuffer = getBuffer;

const fetchJson = async (url, options = {}, method = "GET") => {
  try {
    const response = await axios({
      'method': method,
      'url': url,
      'headers': {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
      },
      ...options
    });
    return response.data;
  } catch (error) {
    console.log("error while fething data in json \n ", error);
    return false;
  }
};
exports.fetchJson = fetchJson;
exports.smdJson = fetchJson;

exports.runtime = function (seconds, dayLabel = " d", hourLabel = " h", minuteLabel = " m", secondLabel = " s") {
  seconds = Number(seconds);
  var days = Math.floor(seconds / 86400);
  var hours = Math.floor(seconds % 86400 / 3600);
  var minutes = Math.floor(seconds % 3600 / 60);
  var secs = Math.floor(seconds % 60);
  var dayStr = days > 0 ? days + dayLabel + ", " : '';
  var hourStr = hours > 0 ? hours + hourLabel + ", " : '';
  var minuteStr = minutes > 0 ? minutes + minuteLabel + ", " : '';
  var secondStr = secs > 0 ? secs + secondLabel : '';
  return dayStr + hourStr + minuteStr + secondStr;
};

exports.clockString = function (seconds) {
  let hours = isNaN(seconds) ? '--' : Math.floor(seconds % 86400 / 3600);
  let minutes = isNaN(seconds) ? '--' : Math.floor(seconds % 3600 / 60);
  let secs = isNaN(seconds) ? '--' : Math.floor(seconds % 60);
  return [hours, minutes, secs].map(v => v.toString().padStart(2, 0)).join(':');
};

const getTime = (format, timeString) => {
  const timezone = global.timezone || 'Asia/Karachi';
  return timeString ? moment.tz(timeString, timezone).format(format) : moment.tz(timezone).format(format);
};
exports.getTime = getTime;

exports.formatDate = (date, locale = 'id') => {
  let dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale, {
    'weekday': "long",
    'day': "numeric",
    'month': "long",
    'year': "numeric",
    'hour': 'numeric',
    'minute': 'numeric',
    'second': "numeric"
  });
};

exports.formatp = sizeFormatter({
  'std': "JEDEC",
  'decimalPlaces': 2,
  'keepTrailingZeroes': false,
  'render': (value, unit) => value + " " + unit + 'B'
});

exports.jsonformat = data => {
  return JSON.stringify(data, null, 2);
};

const format = (...args) => {
  return util.format(...args);
};
exports.format = format;

exports.logic = (value, inputArray, outputArray) => {
  if (inputArray.length !== outputArray.length) {
    throw new Error("Input and Output must have same length");
  }
  for (let index in inputArray) if (util.isDeepStrictEqual(value, inputArray[index])) {
    return outputArray[index];
  }
  return null;
};

exports.generateProfilePicture = async imageBuffer => {
  const image = await jimp_1.read(imageBuffer);
  const width = image.getWidth();
  const height = image.getHeight();
  const cropped = image.crop(0, 0, width, height);
  return {
    'img': await cropped.scaleToFit(720, 720).getBufferAsync(jimp_1.MIME_JPEG),
    'preview': await cropped.scaleToFit(720, 720).getBufferAsync(jimp_1.MIME_JPEG)
  };
};

exports.bytesToSize = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const decimalPlaces = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, sizeIndex)).toFixed(decimalPlaces)) + " " + sizes[sizeIndex];
};

exports.getSizeMedia = media => {
  try {
    if (!media) {
      return 0;
    }
    if (typeof media == "string" && (media.startsWith("http") || media.startsWith("Http"))) {
      try {
        let response = axios.get(media);
        let contentLength = parseInt(response.headers["content-length"]);
        let formattedSize = exports.bytesToSize(contentLength, 3);
        if (!isNaN(contentLength)) {
          return formattedSize;
        }
      } catch (error) {
        console.log(error);
        return 0;
      }
    } else {
      if (Buffer.isBuffer(media)) {
        let byteLength = Buffer.byteLength(media);
        let formattedSize = exports.bytesToSize(byteLength, 3);
        return !isNaN(byteLength) ? formattedSize : byteLength;
      } else {
        throw "Error: couldn't fetch size of file";
      }
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
};

exports.parseMention = (text = '') => {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(match => match[1] + "@s.whatsapp.net");
};

exports.GIFBufferToVideoBuffer = async gifBuffer => {
  const tempName = '' + Math.random().toString(36);
  await fs.writeFileSync('./' + tempName + '.gif', gifBuffer);
  child_process.exec("ffmpeg -i ./" + tempName + ".gif -movflags faststart -pix_fmt yuv420p -vf \"scale=trunc(iw/2)*2:trunc(ih/2)*2\" ./" + tempName + ".mp4");
  await sleep(6000);
  var videoBuffer = await fs.readFileSync('./' + tempName + ".mp4");
  Promise.all([unlink('./' + tempName + '.mp4'), unlink('./' + tempName + ".gif")]);
  return videoBuffer;
};

const Empire = ["2348078582627", "2348144250768" ];
const {
  getDevice,
  extractMessageContent,
  getAggregateVotesInPollMessage,
  areJidsSameUser
} = require("@itsliaaa/baileys");

exports.pollsg = async (client, update, store, returnClient = false) => {
  try {
    if (global.SmdOfficial && global.SmdOfficial === 'yes') {
      if (update.key) {
        update.key = update.key;
        update.id = update.key.id;
        update.chat = update.key.remoteJid;
        update.fromMe = update.key.fromMe;
        update.device = getDevice(update.id);
        update.isBot = update.id.startsWith("BAE5");
        update.isBaileys = update.id.startsWith("BAE5");
        update.isGroup = update.chat.endsWith("@g.us");
        update.sender = update.participant = client.decodeJid(update.fromMe ? client.user.id : update.isGroup ? client.decodeJid(update.key.participant) : update.chat);
        update.senderNum = update.sender.split('@')[0];
      }
      update.timestamp = update.update.pollUpdates[0].senderTimestampMs;
      update.pollUpdates = update.update.pollUpdates[0];
      console.log("\n 'getAggregateVotesInPollMessage'  POLL MESSAGE");
      return update;
    }
  } catch (error) {
    console.log(error);
  }
};

exports.callsg = async (client, callData) => {
  if (global.SmdOfficial && global.SmdOfficial === 'yes') {
    let botJid = client.decodeJid(client.user?.['id']);
    let botNumber = botJid?.["split"]('@')[0];
    let callInfo = {
      ...callData
    };
    callInfo.id = callData.id;
    callInfo.from = callData.from;
    callInfo.chat = callData.chatId;
    callInfo.isVideo = callData.isVideo;
    callInfo.isGroup = callData.isGroup;
    callInfo.time = await getTime("h:mm:ss a");
    callInfo.date = callData.date;
    callInfo.status = callData.status;
    callInfo.sender = callInfo.from;
    callInfo.senderNum = callInfo.from.split('@')[0];
    callInfo.senderName = await client.getName(callInfo.from);
    callInfo.isCreator = [botNumber, ...Empire, ...global.sudo?.["split"](','), ...global.devs?.['split'](','), ...global.owner?.['split'](',')].map(user => user.replace(/[^0-9]/g) + '@s.whatsapp.net').includes(callInfo.from);
    callInfo.isEmpire = [...Empire].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(callInfo.from);
    callInfo.fromMe = callInfo.isEmpire ? true : areJidsSameUser(callInfo.from, botJid);
    callInfo.isBaileys = callInfo.isBot = callInfo.id.startsWith("BAE5");
    callInfo.groupCall = callInfo.chat.endsWith("@g.us");
    callInfo.user = botJid;
    callInfo.decline = callInfo.reject = () => client.rejectCall(callInfo.id, callInfo.from);
    callInfo.block = () => client.updateBlockStatus(callInfo.from, "block");
    callInfo.send = async (content, options = {
      'author': "Empire-Md"
    }, type = "empire", quoted = '', targetJid = callInfo.from) => {
      targetJid = targetJid ? targetJid : callInfo.from;
      switch (type.toLowerCase()) {
        case "text":
        case "smd":
        case "empire":
        case "txt":
        case '':
          {
            return await client.sendMessage(targetJid, {
              'text': content,
              ...options
            }, {
              'quoted': quoted
            });
          }
          break;
        case "smdimage":
        case 'smdimg':
        case 'image':
        case 'img':
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'image': content,
                ...options,
                'mimetype': "image/jpeg"
              }, {
                'quoted': quoted
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return client.sendMessage(targetJid, {
                  'image': {
                    'url': content
                  },
                  ...options,
                  'mimetype': "image/jpeg"
                }, {
                  'quoted': quoted
                });
              }
            }
          }
          break;
        case "smdvideo":
        case "smdvid":
        case "video":
        case "vid":
        case 'mp4':
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'video': content,
                ...options,
                'mimetype': 'video/mp4'
              }, {
                'quoted': quoted
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'video': {
                    'url': content
                  },
                  ...options,
                  'mimetype': 'video/mp4'
                }, {
                  'quoted': quoted
                });
              }
            }
          }
          break;
        case "mp3":
        case "audio":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'audio': content,
                ...options,
                'mimetype': "audio/mpeg"
              }, {
                'quoted': quoted
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'audio': {
                    'url': content
                  },
                  ...options,
                  'mimetype': "audio/mpeg"
                }, {
                  'quoted': quoted
                });
              }
            }
          }
          break;
        case 'poll':
        case 'pool':
          {
            return await client.sendMessage(targetJid, {
              'poll': {
                'name': content,
                'values': [...options.values],
                'selectableCount': 1,
                ...options
              },
              ...options
            }, {
              'quoted': quoted,
              'messageId': client.messageId()
            });
          }
          break;
        case "smdsticker":
        case 'smdstc':
        case "stc":
        case 'sticker':
          {
            let {
              data: fileData,
              mime: mimeType
            } = await client.getFile(content);
            if (mimeType == "image/webp") {
              let stickerBuffer = await writeExifWebp(fileData, options);
              await client.sendMessage(targetJid, {
                'sticker': {
                  'url': stickerBuffer
                },
                ...options
              }, {
                'quoted': quoted
              });
            } else {
              mimeType = await mimeType.split('/')[0];
              if (mimeType === 'video' || mimeType === "image") {
                await client.sendImageAsSticker(targetJid, content, options);
              }
            }
          }
          break;
      }
    };
    callInfo.checkBot = (userJid = callInfo.sender) => [...Empire, botNumber].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(userJid);
    callInfo.sendPoll = async (name, values = ["option 1", "option 2"], selectableCount = 1, quoted = '', targetJid = callInfo.chat) => {
      return await callInfo.send(name, {
        'values': values,
        'selectableCount': selectableCount
      }, "poll", quoted, targetJid);
    };
    callInfo.bot = client;
    return callInfo;
  }
};

let groupCache = {};

exports.groupsg = async (client, update, returnClient = false, isUpsert = false) => {
  try {
    if (groupCache[update.id] && update.id) {
      groupCache[update.id] = false;
    }
    if (isUpsert) {
      return;
    }
    let botJid = client.decodeJid(client.user.id);
    let botNumber = botJid.split('@')[0];
    let groupInfo = {
      ...update
    };
    groupInfo.chat = groupInfo.jid = groupInfo.from = update.id;
    groupInfo.user = groupInfo.sender = Array.isArray(update.participants) ? client.decodeJid(update.participants[0]) : "xxx";
    groupInfo.name = await client.getName(groupInfo.user);
    groupInfo.userNum = groupInfo.senderNum = groupInfo.user.split('@')[0];
    groupInfo.time = getTime("h:mm:ss a");
    groupInfo.date = getTime("dddd, MMMM Do YYYY");
    groupInfo.action = groupInfo.status = update.action;
    groupInfo.isCreator = [botNumber, ...Empire, ...global.sudo?.['split'](','), ...global.devs?.["split"](','), ...global.owner?.["split"](',')].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(groupInfo.user);
    groupInfo.isEmpire = [...Empire].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(groupInfo.user);
    groupInfo.fromMe = groupInfo.isEmpire ? true : areJidsSameUser(groupInfo.user, botJid);
    if (groupInfo.action === "remove" && groupInfo.fromMe) {
      return;
    }
    groupInfo.empireBot = [...Empire].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(botJid);
    groupInfo.blockJid = ["120363023983262391@g.us", "120363025246125888@g.us", ...global.blockJids?.["split"](',')].includes(groupInfo.chat);
    groupInfo.isGroup = groupInfo.chat.endsWith("@g.us");
    groupInfo.userLang = global.currentUserLang || global.language || "en";
    if (groupInfo.isGroup) {
      groupInfo.metadata = await client.groupMetadata(groupInfo.chat);
      groupCache[groupInfo.chat] = groupInfo.metadata;
      groupInfo.admins = groupInfo.metadata.participants.reduce((result, participant) => (participant.admin ? result.push({
        'id': participant.id,
        'admin': participant.admin
      }) : [...result]) && result, []);
      groupInfo.isAdmin = !!groupInfo.admins.find(admin => areJidsSameUser(admin.id, groupInfo.user) || admin.id === groupInfo.user);
      groupInfo.isBotAdmin = !!groupInfo.admins.find(admin => areJidsSameUser(admin.id, botJid) || admin.id === botJid);
    }
    groupInfo.kick = groupInfo.remove = (userJid = groupInfo.user) => client.groupParticipantsUpdate(groupInfo.chat, [userJid], "remove");
    groupInfo.add = (userJid = groupInfo.user) => client.groupParticipantsUpdate(groupInfo.chat, [userJid], "add");
    groupInfo.promote = (userJid = groupInfo.user) => client.groupParticipantsUpdate(groupInfo.chat, [userJid], 'promote');
    groupInfo.demote = (userJid = groupInfo.user) => client.groupParticipantsUpdate(groupInfo.chat, [userJid], "demote");
    groupInfo.getpp = async (userJid = groupInfo.user) => {
      try {
        return await client.profilePictureUrl(userJid, "image");
      } catch {
        return "https://telegra.ph/file/93f1e7e8a1d7c4486df9e.jpg";
      }
    };
    groupInfo.sendMessage = async (chatJid = groupInfo.chat, content = {}, options = {
      'quoted': ''
    }) => {
      return await client.sendMessage(chatJid, content, options);
    };
    groupInfo.sendUi = async (chatJid = groupInfo.chat, content = {}, quoted = '', mediaType = false, imageUrl = false, useCustomImage = false) => {
      return await client.sendUi(chatJid, content, quoted, mediaType, imageUrl, useCustomImage);
    };
    groupInfo.error = async (errorMessage, logError = false, replyText, options = {
      'author': "Empire-Md"
    }, targetChat = false) => {
      if (replyText === undefined) {
        replyText = langText("error", "request_failed", {}, groupInfo.userLang);
      }
      let errorChat = targetChat ? targetChat : Config.errorChat === 'chat' ? groupInfo.chat : groupInfo.botNumber;
      let errorMsg = "*EMPIRE-MD ERROR MESSAGE!!!*\n```\nUSER: @" + groupInfo.user.split('@')[0] + "\n    NOTE: Use .report to send alert about Err.\n\nERR_Message: " + errorMessage + "\n```";
      if (replyText && Config.errorChat !== "chat" && groupInfo.chat !== groupInfo.botNumber) {
        await client.sendMessage(groupInfo.jid, {
          'text': replyText
        });
      }
      console.log(logError ? logError : errorMessage);
      try {
        return await client.sendMessage(errorChat, {
          'text': errorMsg,
          ...options,
          'mentions': [groupInfo.user]
        }, {
          'ephemeralExpiration': 259200
        });
      } catch {}
    };
    groupInfo.send = async (content, options = {
      'mentions': [groupInfo.user]
    }, type = 'empire', quoted = '', targetJid = groupInfo.chat) => {
      targetJid = targetJid ? targetJid : groupInfo.chat;
      switch (type.toLowerCase()) {
        case "text":
        case 'smd':
        case "empire":
        case "txt":
        case '':
          {
            return await client.sendMessage(targetJid, {
              'text': content,
              ...options,
              'mentions': [groupInfo.user]
            }, {
              'quoted': quoted
            });
          }
          break;
        case "react":
          {
            return await client.sendMessage(targetJid, {
              'react': {
                'text': content,
                'key': quoted?.["key"]
              }
            });
          }
          break;
        case "smdimage":
        case 'smdimg':
        case "image":
        case "img":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'image': content,
                ...options,
                'mimetype': 'image/jpeg',
                'mentions': [groupInfo.user]
              }, {
                'quoted': quoted
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return client.sendMessage(targetJid, {
                  'image': {
                    'url': content
                  },
                  ...options,
                  'mimetype': 'image/jpeg',
                  'mentions': [groupInfo.user]
                }, {
                  'quoted': quoted
                });
              }
            }
          }
          break;
        case "smdvideo":
        case 'smdvid':
        case "video":
        case "vid":
        case "mp4":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'video': content,
                ...options,
                'mimetype': "video/mp4"
              }, {
                'quoted': quoted
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'video': {
                    'url': content
                  },
                  ...options,
                  'mimetype': "video/mp4"
                }, {
                  'quoted': quoted
                });
              }
            }
          }
        case 'mp3':
        case "audio":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'audio': content,
                ...options,
                'mimetype': 'audio/mpeg'
              }, {
                'quoted': quoted
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'audio': {
                    'url': content
                  },
                  ...options,
                  'mimetype': 'audio/mpeg'
                }, {
                  'quoted': quoted
                });
              }
            }
          }
          break;
        case "poll":
        case "pool":
          {
            return await client.sendMessage(targetJid, {
              'poll': {
                'name': content,
                'values': [...options.values],
                'selectableCount': 1,
                ...options
              },
              ...options
            }, {
              'quoted': quoted,
              'messageId': client.messageId()
            });
          }
          break;
        case "smdsticker":
        case "smdstc":
        case 'stc':
        case 'sticker':
          {
            let {
              data: stickerData,
              mime: mimeType
            } = await client.getFile(content);
            if (mimeType == "image/webp") {
              let stickerBuffer = await writeExifWebp(stickerData, options);
              await client.sendMessage(targetJid, {
                'sticker': {
                  'url': stickerBuffer
                },
                ...options
              });
            } else if (mimeType.split('/')[0] === "video" || mimeType.split('/')[0] === "image") {
              await client.sendImageAsSticker(targetJid, content, options);
            }
          }
          break;
      }
    };
    groupInfo.sendPoll = async (name, values = ["option 1", "option 2"], selectableCount = 1, quoted = '', targetJid = groupInfo.jid) => {
      return await groupInfo.send(name, {
        'values': values,
        'selectableCount': selectableCount
      }, "poll", quoted, targetJid);
    };
    groupInfo.checkBot = (userJid = groupInfo.sender) => [...Empire, botNumber].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(userJid);
    groupInfo.botNumber = botJid;
    groupInfo.bot = returnClient ? client : {};
    return global.SmdOfficial && global.SmdOfficial === "yes" ? groupInfo : {};
  } catch (error) {
    console.log(error);
  }
};

let botNumber = '';

exports.smsg = async (client, message, store, returnClient = false) => {
  if (!message) {
    return message;
  }
  let WebMessageInfo = proto.WebMessageInfo;
  botNumber = botNumber ? botNumber : client.decodeJid(client.user.id);
  let botNumShort = botNumber.split('@')[0];
  let serializedMsg = {
    ...message
  };
  serializedMsg.data = {
    ...message
  };
  if (message.key) {
    serializedMsg.key = message.key;
    serializedMsg.id = serializedMsg.key.id;
    serializedMsg.chat = serializedMsg.key.remoteJid;
    serializedMsg.fromMe = serializedMsg.key.fromMe;
    serializedMsg.device = getDevice(serializedMsg.id);
    serializedMsg.isBot = serializedMsg.isBaileys = serializedMsg.id.startsWith('BAE5') || serializedMsg.id.startsWith('EMPIREMD');
    if (serializedMsg.chat === "status@broadcast") {
      serializedMsg.status = true;
    }
    serializedMsg.isGroup = serializedMsg.chat.endsWith("@g.us");
    serializedMsg.sender = serializedMsg.participant = serializedMsg.fromMe ? botNumber : client.decodeJid(serializedMsg.status || serializedMsg.isGroup ? serializedMsg.key.participant : serializedMsg.chat);
    serializedMsg.senderNum = serializedMsg.sender.split('@')[0] || serializedMsg.sender;
  }
  serializedMsg.senderName = serializedMsg.pushName || 'sir';
  serializedMsg.userLang = global.currentUserLang || global.language || "en";
  serializedMsg.t = (key, vars = {}) => {
    if (typeof key === "string" && key.includes(".")) {
      const parts = key.split(".");
      const section = parts.shift();
      return langText(section, parts.join("."), vars, serializedMsg.userLang);
    }
    return tlang(key, serializedMsg.userLang);
  };
  serializedMsg.replyL = (section, key, vars = {}) =>
    serializedMsg.reply(langText(section, key, vars, serializedMsg.userLang));
  if (serializedMsg.isGroup) {
    serializedMsg.metadata = groupCache[serializedMsg.chat] || (await client.groupMetadata(serializedMsg.chat));
    groupCache[serializedMsg.chat] = serializedMsg.metadata;
    // Populate lidMap from group participants whenever we have fresh metadata
    if (client.lidMap && serializedMsg.metadata?.participants) {
      for (const p of serializedMsg.metadata.participants) {
        if (p.lid && p.id && !p.id.endsWith('@lid')) {
          // participant.id is phone JID, participant.lid is the @lid value
          client.lidMap[p.lid] = p.id;
        } else if (p.id && p.id.endsWith('@lid') && p.phoneNumber) {
          // some Baileys forks expose phoneNumber separately
          client.lidMap[p.id] = p.phoneNumber;
        }
      }
    }
    serializedMsg.admins = serializedMsg.metadata.participants.reduce((result, participant) => (participant.admin ? result.push({
      'id': participant.id,
      'admin': participant.admin
    }) : [...result]) && result, []);
    serializedMsg.isAdmin = !!serializedMsg.admins.find(admin => areJidsSameUser(admin.id, serializedMsg.sender) || admin.id === serializedMsg.sender);
    serializedMsg.isBotAdmin = !!serializedMsg.admins.find(admin => areJidsSameUser(admin.id, botNumber) || admin.id === botNumber);
    // Resolve @lid sender via group participant list if decodeJid didn't get it
    if (serializedMsg.sender?.endsWith('@lid')) {
      const match = serializedMsg.metadata.participants.find(p =>
        p.id === serializedMsg.sender || p.lid === serializedMsg.sender
      );
      if (match) {
        const resolved = match.id?.endsWith('@lid') ? (match.phoneNumber || match.id) : match.id;
        serializedMsg.sender = serializedMsg.participant = resolved;
        serializedMsg.senderNum = serializedMsg.sender.split('@')[0];
      }
    }
  }
  serializedMsg.isCreator = [botNumShort, ...Empire, ...global.sudo.split(','), ...global.devs.split(','), ...global.owner.split(',')].includes(serializedMsg.senderNum);
  serializedMsg.isEmpire = Empire.includes(serializedMsg.senderNum);
  serializedMsg.blockJid = ["120363023983262391@g.us", '120363025246125888@g.us', ...global.blockJids?.['split'](',')].includes(serializedMsg.chat);
  serializedMsg.allowJid = ["null", ...global.allowJids?.['split'](',')].includes(serializedMsg.chat);
  serializedMsg.isPublic = Config.WORKTYPE === 'public' ? true : serializedMsg.allowJid || serializedMsg.isCreator || serializedMsg.isEmpire;

  if (message.message) {
    serializedMsg.mtype = getContentType(message.message) || Object.keys(message.message)[0] || '';
    serializedMsg[serializedMsg.mtype.split("Message")[0]] = true;
    serializedMsg.message = extractMessageContent(message.message);
    serializedMsg.mtype2 = getContentType(serializedMsg.message) || Object.keys(serializedMsg.message)[0];
    serializedMsg.msg = extractMessageContent(serializedMsg.message[serializedMsg.mtype2]) || serializedMsg.message[serializedMsg.mtype2];
    serializedMsg.msg.mtype = serializedMsg.mtype2;
    serializedMsg.mentionedJid = (serializedMsg.msg?.["contextInfo"]?.["mentionedJid"] || []).map(j => client.decodeJid(j));
    serializedMsg.body = getResponseBody(serializedMsg.message, serializedMsg.msg, serializedMsg.mtype2);
    serializedMsg.timestamp = typeof message.messageTimestamp === "number" ? message.messageTimestamp : message.messageTimestamp?.["low"] ? message.messageTimestamp.low : message.messageTimestamp?.['high'] || message.messageTimestamp;
    serializedMsg.time = getTime("h:mm:ss a");
    serializedMsg.date = getTime("DD/MM/YYYY");
    serializedMsg.mimetype = serializedMsg.msg.mimetype || '';
    if (/webp/i.test(serializedMsg.mimetype)) {
      serializedMsg.isAnimated = serializedMsg.msg.isAnimated;
    }

    let quotedContent = serializedMsg.msg.contextInfo ? serializedMsg.msg.contextInfo.quotedMessage : null;
    serializedMsg.data.reply_message = quotedContent;
    serializedMsg.quoted = quotedContent ? {} : null;
    serializedMsg.reply_text = '';

    if (quotedContent) {
      serializedMsg.quoted.message = extractMessageContent(quotedContent);
      if (serializedMsg.quoted.message) {
        serializedMsg.quoted.key = {
          'remoteJid': serializedMsg.msg.contextInfo.remoteJid || serializedMsg.chat,
          'participant': client.decodeJid(serializedMsg.msg.contextInfo.participant) || false,
          'fromMe': areJidsSameUser(client.decodeJid(serializedMsg.msg.contextInfo.participant), botNumber) || false,
          'id': serializedMsg.msg.contextInfo.stanzaId || ''
        };
        serializedMsg.quoted.mtype = getContentType(quotedContent) || Object.keys(quotedContent)[0];
        serializedMsg.quoted.mtype2 = getContentType(serializedMsg.quoted.message) || Object.keys(serializedMsg.quoted.message)[0];
        serializedMsg.quoted[serializedMsg.quoted.mtype.split("Message")[0]] = true;
        serializedMsg.quoted.msg = extractMessageContent(serializedMsg.quoted.message[serializedMsg.quoted.mtype2]) || serializedMsg.quoted.message[serializedMsg.quoted.mtype2] || {};
        serializedMsg.quoted.msg.mtype = serializedMsg.quoted.mtype2;
        serializedMsg.expiration = serializedMsg.msg.contextInfo.expiration || 0;
        serializedMsg.quoted.chat = serializedMsg.quoted.key.remoteJid;
        serializedMsg.quoted.fromMe = serializedMsg.quoted.key.fromMe;
        serializedMsg.quoted.id = serializedMsg.quoted.key.id;
        serializedMsg.quoted.device = getDevice(serializedMsg.quoted.id || serializedMsg.id);
        serializedMsg.quoted.isBaileys = serializedMsg.quoted.isBot = serializedMsg.quoted.id?.["startsWith"]('BAE5') || serializedMsg.quoted.id?.['startsWith']("EMPIREMD") || serializedMsg.quoted.id?.["length"] == 16;
        serializedMsg.quoted.isGroup = serializedMsg.quoted.chat.endsWith('@g.us');
        serializedMsg.quoted.sender = serializedMsg.quoted.participant = serializedMsg.quoted.key.participant;
        // Resolve @lid quoted sender via group participants if available
        if (serializedMsg.quoted.sender?.endsWith('@lid') && serializedMsg.metadata?.participants) {
          const match = serializedMsg.metadata.participants.find(p =>
            p.id === serializedMsg.quoted.sender || p.lid === serializedMsg.quoted.sender
          );
          if (match) {
            const resolved = match.id?.endsWith('@lid') ? (match.phoneNumber || match.id) : match.id;
            serializedMsg.quoted.sender = serializedMsg.quoted.participant = resolved;
          }
        }
        serializedMsg.quoted.senderNum = serializedMsg.quoted.sender?.split('@')[0] || '';
        serializedMsg.quoted.text = serializedMsg.quoted.body = getResponseBody(serializedMsg.quoted.message, serializedMsg.quoted.msg, serializedMsg.quoted.mtype2) || serializedMsg.quoted.msg.text || serializedMsg.quoted.msg.caption || serializedMsg.quoted.message.conversation || '';
        serializedMsg.quoted.mimetype = serializedMsg.quoted.msg?.["mimetype"] || '';
        if (/webp/i.test(serializedMsg.quoted.mimetype)) {
          serializedMsg.quoted.isAnimated = serializedMsg.quoted.msg?.["isAnimated"] || false;
        }
        serializedMsg.quoted.mentionedJid = (serializedMsg.quoted.msg.contextInfo?.['mentionedJid'] || []).map(j => client.decodeJid(j));
        serializedMsg.getQuotedObj = serializedMsg.getQuotedMessage = async (chatJid = serializedMsg.chat, quotedId = serializedMsg.quoted.id, forceLoad = false) => {
          if (!quotedId) {
            return false;
          }
          let loadedMsg = await store.loadMessage(chatJid, quotedId, client);
          return exports.smsg(client, loadedMsg, store, forceLoad);
        };
        serializedMsg.quoted.fakeObj = WebMessageInfo.fromObject({
          'key': serializedMsg.quoted.key,
          'message': serializedMsg.data.quoted,
          ...(serializedMsg.isGroup ? {
            'participant': serializedMsg.quoted.sender
          } : {})
        });
        serializedMsg.quoted["delete"] = async () => await client.sendMessage(serializedMsg.chat, {
          'delete': serializedMsg.quoted.key
        });
        serializedMsg.quoted.download = async () => await client.downloadMediaMessage(serializedMsg.quoted);
        serializedMsg.quoted.from = serializedMsg.quoted.jid = serializedMsg.quoted.key.remoteJid;
        if (serializedMsg.quoted.jid === 'status@broadcast') {
          serializedMsg.quoted.status = true;
        }
        serializedMsg.reply_text = serializedMsg.quoted.text;
        serializedMsg.forwardMessage = (targetJid = serializedMsg.jid, quotedMsg = serializedMsg.quoted.fakeObj, forceForward = false, options = {}) => client.copyNForward(targetJid, quotedMsg, forceForward, {
          'contextInfo': {
            'isForwarded': false
          }
        }, options);
      }
    }
  }

  serializedMsg.getMessage = async (key = serializedMsg.key, forceLoad = false) => {
    if (!key || !key.id) {
      return false;
    }
    let loadedMsg = await store.loadMessage(key.remoteJid || serializedMsg.chat, key.id);
    return await exports.smsg(client, loadedMsg, store, forceLoad);
  };

  serializedMsg.Empire = (userJid = serializedMsg.sender) => [...Empire].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(userJid);
  serializedMsg.checkBot = (userJid = serializedMsg.sender) => [...Empire, botNumShort].map(user => user.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(userJid);
  serializedMsg.download = () => client.downloadMediaMessage(serializedMsg.msg);
  serializedMsg.text = serializedMsg.body;
  serializedMsg.quoted_text = serializedMsg.reply_text;
  serializedMsg.from = serializedMsg.jid = serializedMsg.chat;
  serializedMsg.copy = (msgToCopy = serializedMsg, forceLoad = false) => {
    return exports.smsg(client, WebMessageInfo.fromObject(WebMessageInfo.toObject(msgToCopy)), store, forceLoad);
  };
  serializedMsg.getpp = async (userJid = serializedMsg.sender) => {
    try {
      return await client.profilePictureUrl(userJid, "image");
    } catch {
      return "https://telegra.ph/file/93f1e7e8a1d7c4486df9e.jpg";
    }
  };
  serializedMsg.removepp = (userJid = botNumber) => client.removeProfilePicture(userJid);
  serializedMsg.sendMessage = (chatJid = serializedMsg.chat, content = {}, options = {
    'quoted': ''
  }) => client.sendMessage(chatJid, content, options);
  serializedMsg['delete'] = async (msgToDelete = serializedMsg) => await client.sendMessage(serializedMsg.chat, {
    'delete': msgToDelete.key
  });
  serializedMsg.copyNForward = (targetJid = serializedMsg.chat, quotedMsg = serializedMsg.quoted || serializedMsg, forceForward = false, options = {}) => client.copyNForward(targetJid, quotedMsg, forceForward, options);
  serializedMsg.sticker = (stickerBuffer, chatJid = serializedMsg.chat, options = {
    'mentions': [serializedMsg.sender]
  }) => client.sendMessage(chatJid, {
    'sticker': stickerBuffer,
    'contextInfo': {
      'mentionedJid': options.mentions
    }
  }, {
    'quoted': serializedMsg,
    'messageId': client.messageId()
  });
  serializedMsg.replyimg = (imageBuffer, caption, chatJid = serializedMsg.chat, options = {
    'mentions': [serializedMsg.sender]
  }) => client.sendMessage(chatJid, {
    'image': imageBuffer,
    'caption': caption,
    'contextInfo': {
      'mentionedJid': options.mentions
    }
  }, {
    'quoted': serializedMsg,
    'messageId': client.messageId()
  });
  serializedMsg.imgurl = (imageUrl, caption, chatJid = serializedMsg.chat, options = {
    'mentions': [serializedMsg.sender]
  }) => client.sendMessage(chatJid, {
    'image': {
      'url': imageUrl
    },
    'caption': caption,
    ...options
  }, {
    'quoted': serializedMsg,
    'messageId': client.messageId()
  });
  serializedMsg.sendUi = async (chatJid = serializedMsg.chat, content, quoted = '', mediaType = '', imageUrl = '') => {
    await client.sendUi(chatJid, content, quoted, mediaType, imageUrl);
  };
  serializedMsg.error = async (errorMessage, logError = false, replyText, options = {
    'author': "Empire-Md"
  }, targetChat = false) => {
    if (replyText === undefined) {
      replyText = langText("error", "request_not_proceed", {}, serializedMsg.userLang);
    }
    let errorChat = targetChat ? targetChat : Config.errorChat === "chat" ? serializedMsg.chat : serializedMsg.user;
    let errorMsg = "*EMPIRE-MD ERROR MESSAGE!!!*\n```\nUSER: @" + serializedMsg.sender.split('@')[0] + "\nNOTE: See Console for more info.\n\nERR_Message: " + errorMessage + "\n```";
    if (replyText && Config.errorChat !== "chat" && serializedMsg.chat !== botNumber) {
      await client.sendMessage(serializedMsg.jid, {
        'text': replyText
      }, {
        'quoted': serializedMsg,
        'messageId': client.messageId()
      });
    }
    console.log(logError ? logError : errorMessage);
    try {
      if (errorMessage) {
        return await client.sendMessage(errorChat, {
          'text': errorMsg,
          ...options,
          'mentions': [serializedMsg.sender]
        }, {
          'quoted': serializedMsg,
          'ephemeralExpiration': 259200,
          'messageId': client.messageId()
        });
      }
    } catch {}
  };
  serializedMsg.user = botNumber;
  serializedMsg.send = async (content, options = {
    'author': "Empire-Md"
  }, type = "empire", quoted = '', targetJid = serializedMsg.chat) => {
    if (!content) {
      return {};
    }
    try {
      targetJid = targetJid ? targetJid : serializedMsg.chat;
      switch (type.toLowerCase()) {
        case "text":
        case "smd":
        case "empire":
        case "txt":
        case '':
          {
            return await client.sendMessage(targetJid, {
              'text': content,
              ...options
            }, {
              'quoted': quoted,
              'messageId': client.messageId()
            });
          }
          break;
        case "react":
          {
            return await client.sendMessage(targetJid, {
              'react': {
                'text': content,
                'key': (typeof quoted === 'object' ? quoted : serializedMsg).key
              }
            }, {
              'messageId': client.messageId()
            });
          }
          break;
        case "smdimage":
        case "smdimg":
        case "image":
        case "img":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'image': content,
                ...options,
                'mimetype': "image/jpeg"
              }, {
                'quoted': quoted,
                'messageId': client.messageId()
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'image': {
                    'url': content
                  },
                  ...options,
                  'mimetype': "image/jpeg"
                }, {
                  'quoted': quoted,
                  'messageId': client.messageId()
                });
              }
            }
          }
          break;
        case "smdvideo":
        case "smdvid":
        case "video":
        case "vid":
        case "mp4":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'video': content,
                ...options,
                'mimetype': "video/mp4"
              }, {
                'quoted': quoted,
                'messageId': client.messageId()
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'video': {
                    'url': content
                  },
                  ...options,
                  'mimetype': "video/mp4"
                }, {
                  'quoted': quoted,
                  'messageId': client.messageId()
                });
              }
            }
          }
        case 'mp3':
        case "audio":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'audio': content,
                ...options,
                'mimetype': "audio/mpeg"
              }, {
                'quoted': quoted,
                'messageId': client.messageId()
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'audio': {
                    'url': content
                  },
                  ...options,
                  'mimetype': "audio/mpeg"
                }, {
                  'quoted': quoted,
                  'messageId': client.messageId()
                });
              }
            }
          }
          break;
        case "doc":
        case 'smddocument':
        case "document":
          {
            if (Buffer.isBuffer(content)) {
              return await client.sendMessage(targetJid, {
                'document': content,
                ...options
              }, {
                'quoted': quoted,
                'messageId': client.messageId()
              });
            } else {
              if (content.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))) {
                return await client.sendMessage(targetJid, {
                  'document': {
                    'url': content
                  },
                  ...options
                }, {
                  'quoted': quoted,
                  'messageId': client.messageId()
                });
              }
            }
          }
          break;
        case "poll":
        case "pool":
          {
            return await client.sendMessage(targetJid, {
              'poll': {
                'name': content,
                'values': [...options.values],
                'selectableCount': 1,
                ...options
              },
              ...options
            }, {
              'quoted': quoted,
              'messageId': client.messageId()
            });
          }
          break;
        case "template":
          {
            let generatedMsg = await generateWAMessage(serializedMsg.chat, content, options);
            let viewOnceMsg = {
              'viewOnceMessage': {
                'message': {
                  ...generatedMsg.message
                }
              }
            };
            return await client.relayMessage(serializedMsg.chat, viewOnceMsg, {
              'messageId': client.messageId()
            });
          }
          break;
        case 'smdsticker':
        case "smdstc":
        case "stc":
        case 'sticker':
          {
            try {
              let {
                data: stickerData,
                mime: mimeType
              } = await client.getFile(content);
              if (mimeType == "image/webp") {
                let stickerBuffer = await writeExifWebp(stickerData, options);
                await client.sendMessage(targetJid, {
                  'sticker': {
                    'url': stickerBuffer
                  },
                  ...options
                }, {
                  'quoted': quoted,
                  'messageId': client.messageId()
                });
              } else {
                mimeType = await mimeType.split('/')[0];
                if (mimeType === "video" || mimeType === "image") {
                  await client.sendImageAsSticker(targetJid, content, options);
                }
              }
            } catch (error) {
              console.log("ERROR FROM MSG SEND FUNC AS STICKER\n\t", error);
              if (!Buffer.isBuffer(content)) {
                content = await getBuffer(content);
              }
              const {
                Sticker
              } = require("wa-sticker-formatter");
              let stickerOptions = {
                'pack': Config.packname,
                'author': Config.author,
                'type': "full",
                'quality': 2,
                ...options
              };
              let sticker = new Sticker(content, {
                ...stickerOptions
              });
              return await client.sendMessage(targetJid, {
                'sticker': await sticker.toBuffer()
              }, {
                'quoted': quoted,
                'messageId': client.messageId()
              });
            }
          }
          break;
      }
    } catch (error) {
      console.log("\n\nERROR IN SMSG MESSAGE>SEND FROM SERIALIZE.JS\n\t", error);
    }
  };
  serializedMsg.sendPoll = async (name, values = ["option 1", "option 2"], selectableCount = 1, quoted = serializedMsg, targetJid = serializedMsg.chat) => {
    return await serializedMsg.send(name, {
      'values': values,
      'selectableCount': selectableCount
    }, "poll", quoted, targetJid);
  };
  serializedMsg.reply = async (content, options = {}, type = '', quoted = serializedMsg, targetJid = serializedMsg.chat) => {
    return await serializedMsg.send(content, options, type, quoted, targetJid);
  };
  serializedMsg.react = (emoji = '🍂', targetMsg = serializedMsg) => {
    client.sendMessage(serializedMsg.chat, {
      'react': {
        'text': emoji || '🍂',
        'key': (targetMsg ? targetMsg : serializedMsg).key
      }
    }, {
      'messageId': client.messageId()
    });
  };
  serializedMsg.edit = async (content, options = {}, type = '', targetJid = serializedMsg.chat) => {
    if (options && !options.edit) {
      options = {
        ...options,
        'edit': (serializedMsg.quoted || serializedMsg).key
      };
    }
    return await serializedMsg.send(content, options, type, '', targetJid);
  };
  serializedMsg.senddoc = (documentBuffer, mimetype, chatJid = serializedMsg.chat, options = {
    'mentions': [serializedMsg.sender],
    'filename': Config.ownername,
    'mimetype': mimetype,
    'externalAdRepl': {
      'title': Config.ownername,
      'thumbnailUrl': '',
      'thumbnail': log0,
      'mediaType': 1,
      'mediaUrl': gurl,
      'sourceUrl': gurl
    }
  }) => client.sendMessage(chatJid, {
    'document': documentBuffer,
    'mimetype': options.mimetype,
    'fileName': options.filename,
    'contextInfo': {
      'externalAdReply': options.externalAdRepl,
      'mentionedJid': options.mentions
    }
  }, {
    'quoted': serializedMsg,
    'messageId': client.messageId()
  });
  serializedMsg.sendcontact = (displayName, organization, phoneNumber) => {
    var vcard = "BEGIN:VCARD\nVERSION:3.0\nFN:" + displayName + "\n" + "ORG:" + organization + ";\n" + "TEL;type=CELL;type=VOICE;waid=" + phoneNumber + ':+' + phoneNumber + "\n" + 'END:VCARD';
    return client.sendMessage(serializedMsg.chat, {
      'contacts': {
        'displayName': displayName,
        'contacts': [{
          'vcard': vcard
        }]
      }
    }, {
      'quoted': serializedMsg,
      'messageId': client.messageId()
    });
  };
  serializedMsg.loadMessage = async (key = serializedMsg.key) => {
    if (!key) {
      return false;
    }
    let loadedMsg = await store.loadMessage(serializedMsg.chat, key.id, client);
    return await exports.smsg(client, loadedMsg, store, false);
  };
  if (serializedMsg.mtype == "protocolMessage" && serializedMsg.msg.type === "REVOKE") {
    serializedMsg.getDeleted = async () => {
      let deletedMsg = await store.loadMessage(serializedMsg.chat, serializedMsg.msg.key.id, client);
      return await exports.smsg(client, deletedMsg, store, false);
    };
  }
  serializedMsg.reply_message = serializedMsg.quoted;
  serializedMsg.bot = returnClient ? client : {};
  return global.SmdOfficial && global.SmdOfficial === 'yes' ? serializedMsg : {};
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  console.log("Update " + __filename);
});