const config = require('../config');
const { cmd, sck, sck1 } = require("../lib")
const theme = require('../Themes/Empire_Md.json');
const t = theme.STRINGS.global;

//--------------------------------------------
// ANTICALL
//--------------------------------------------
cmd({
  pattern: "anticall",
  desc: "Enable or disable auto-decline of calls",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {

  if (!isOwner) return reply("❌ This command is for the Owner only.");

  const mode = (args[0] || "").toLowerCase();
  if (!["on","off"].includes(mode))
    return reply("Usage: anticall on / anticall off");

  const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";

  let user = await sck1.findOne({ id: botId });
  if (!user) user = await sck1.create({ id: botId });

  user.anticall = mode === "on" ? "true" : "false";
  await user.save();

  reply(`Auto-decline for calls is now ${mode.toUpperCase()}`);
});


//--------------------------------------------
// AUTOREACT (Per User)
//--------------------------------------------
cmd({
  pattern: "autoreact",
  desc: "Enable or disable auto-reactions",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { sender, isOwner, args, reply }) => {

  if (!isOwner) return reply(t.owner);

  const mode = (args[0] || "").toLowerCase();
  if (!["on","off"].includes(mode))
    return reply("Usage: autoreact on / autoreact off");

  let user = await sck1.findOne({ id: sender });
  if (!user) user = await sck1.create({ id: sender });

  user.autoreact = mode === "on" ? "true" : "false";
  await user.save();

  reply(`Auto-reaction is now ${mode.toUpperCase()}`);
});


//--------------------------------------------
// AUTO TYPING (kept config based as you had)
//--------------------------------------------
cmd({
  pattern: "autotyping",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, isOwner, reply }) => {

  if (!isOwner) return reply("Only owner can use this.");

  const status = args[0]?.toLowerCase();
  if (!["on","off"].includes(status))
    return reply("Example: autotyping on / off");

  config.AUTO_TYPING = status === "on" ? "true" : "false";
  reply(`Auto typing ${status}`);
});

cmd({ on: "body" }, async (conn, mek, m, { from }) => {
  if (config.AUTO_TYPING === "true")
    await conn.sendPresenceUpdate("composing", from);
});


//--------------------------------------------
// ALWAYS ONLINE
//--------------------------------------------
cmd({
  pattern: "alwaysonline",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, isOwner, reply, from }) => {

  if (!isOwner) return reply("Only owner can use this.");

  const status = args[0]?.toLowerCase();
  if (!["on","off"].includes(status))
    return reply("Example: alwaysonline on / off");

  config.ALWAYS_ONLINE = status === "on" ? "true" : "false";
  await conn.sendPresenceUpdate(status === "on" ? "available" : "unavailable", from);

  reply(`Bot is now ${status === "on" ? "online" : "offline"}`);
});


//--------------------------------------------
// AUTO RECORDING
//--------------------------------------------
cmd({
  pattern: "autorecording",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, isOwner, reply, from }) => {

  if (!isOwner) return reply("Only owner can use this.");

  const status = args[0]?.toLowerCase();
  if (!["on","off"].includes(status))
    return reply("Example: autorecording on / off");

  config.AUTO_RECORDING = status === "on" ? "true" : "false";

  if (status === "on") {
    await conn.sendPresenceUpdate("recording", from);
    reply("Auto recording enabled.");
  } else {
    await conn.sendPresenceUpdate("available", from);
    reply("Auto recording disabled.");
  }
});


//--------------------------------------------
// STATUS SETTINGS (kept config based)
//--------------------------------------------
cmd({
  pattern: "autoreadstatus",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {

  if (args[0] === "true") {
    config.AUTO_VIEW_STATUS = "true";
    return reply("Auto view enabled.");
  }

  if (args[0] === "false") {
    config.AUTO_VIEW_STATUS = "false";
    return reply("Auto view disabled.");
  }

  reply("Example: autoreadstatus true");
});


cmd({
  pattern: "autolikestatus",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {

  if (args[0] === "true") {
    config.AUTO_LIKE_STATUS = "true";
    return reply("Auto like enabled.");
  }

  if (args[0] === "false") {
    config.AUTO_LIKE_STATUS = "false";
    return reply("Auto like disabled.");
  }

  reply("Example: autolikestatus true");
});


cmd({
  pattern: "autolikeemoji",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, q, reply }) => {

  const input = q || args[0];
  if (!input) return reply("Example: autolikeemoji 💖 or random");

  if (input.toLowerCase() === "random") {
    config.AUTO_LIKE_EMOJI = "random";
    return reply("Auto-like emoji set to random.");
  }

  config.AUTO_LIKE_EMOJI = input;
  reply(`Auto-like emoji set to ${input}`);
});