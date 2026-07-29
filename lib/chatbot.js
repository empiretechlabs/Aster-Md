const { smdJson } = require("./msg");

const PREXZY_API = "https://prexzyapis.com/ai";

let botCache = false;
let botCacheCount = 0;

function getSessionId(message) {
  const chat = String(message.chat || "chat").replace(/[^\w@.-]/g, "_");
  const sender = String(message.sender || "user").replace(/[^\w@.-]/g, "_");
  return `${chat}_${sender}`.slice(0, 120);
}

function pickReply(data) {
  if (!data || data.status === false) return false;
  if (typeof data === "string") return data;
  return data.response || data.message || data.text || data.reply || false;
}

async function askPrexzy(text, userId) {
  let response = await smdJson(
    `${PREXZY_API}/chateverywhere?text=${encodeURIComponent(text)}&userId=${encodeURIComponent(userId)}`
  );
  if (response?.status === true && response.message) {
    return { status: true, response: response.message };
  }

  response = await smdJson(`${PREXZY_API}/ch?q=${encodeURIComponent(text)}`);
  if (response?.status === true && response.response) {
    return { status: true, response: response.response };
  }

  return { status: false, error: response?.message || "Prexzy API failed" };
}

async function resetChatSession(message) {
  const key = getSessionId(message);
  await smdJson(`${PREXZY_API}/chateverywhere-reset?userId=${encodeURIComponent(key)}`);
  return { status: true };
}

async function isChatbotEnabled(message, groupConfig) {
  if (!botCache || botCacheCount >= 10) {
    botCache = (await require("./database").bot_.findOne({ id: "bot_" + message.user })) || { chatbot: "false" };
    botCacheCount = 0;
  } else {
    botCacheCount++;
  }
  const chatConfig =
    groupConfig ||
    (await require("./database").groupdb.findOne({ id: message.chat })) ||
    { chatbot: "false" };
  return botCache?.chatbot === "true" || chatConfig.chatbot === "true";
}

async function handleChatbot(message, { icmd, budy, groupConfig } = {}) {
  if (global.SmdOfficial !== "yes") return;
  if (icmd || message.fromMe || message.isBot || message.mtype === "reactionMessage") return;

  const text = String(budy || message.text || message.body || "").trim();
  if (!text) return;

  if (!(await isChatbotEnabled(message, groupConfig))) return;

  if (message.isGroup) {
    const targetCheck = message.quoted ? message.quoted.sender : message.mentionedJid?.[0] || false;
    if (targetCheck && !message.checkBot(targetCheck)) return;
  }

  const key = getSessionId(message);
  const data = await askPrexzy(text, key);
  const reply = pickReply(data);
  if (!reply) {
    const apiError = data?.error || data?.message;
    if (apiError) {
      await message.send(`*Chatbot API error:* ${apiError}`, {}, "empire", message);
    }
    return;
  }

  await message.send(reply, {}, "empire", message);
}

module.exports = {
  handleChatbot,
  resetChatSession,
  getSessionId
};
