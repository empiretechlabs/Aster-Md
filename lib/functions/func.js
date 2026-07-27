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
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const ROOT_DIR = path.resolve(__dirname, "../../");
const TEMP_DIR = path.join(ROOT_DIR, "temp");
const ENV_PATH = path.join(ROOT_DIR, ".env");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/* ===== Utilities ===== */

async function Catbox(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject(new Error("File not found."));

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    axios({
      url: "https://catbox.moe/user/api.php",
      method: "POST",
      headers: form.getHeaders(),
      data: form,
    })
      .then(res => {
        if (typeof res.data === "string" && res.data.startsWith("https://"))
          resolve(res.data.trim());
        else reject(new Error("Upload failed."));
      })
      .catch(reject);
  });
}

const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 2400000,
      ...options,
    });
    return res.data;
  } catch {
    return null;
  }
};

const getGroupAdmins = (participants = []) =>
  participants.filter(p => p.admin !== null).map(p => p.id);

const getRandom = ext =>
  `${Math.floor(Math.random() * 100000)}${ext}`;

const monospace = text => `\`\`\`${text}\`\`\``;

const h2k = num => {
  if (!num) return "0";
  const units = ["", "K", "M", "B", "T"];
  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  if (!units[tier]) return num.toString();
  const scale = Math.pow(10, tier * 3);
  return (num / scale).toFixed(1).replace(/\.0$/, "") + units[tier];
};

const isUrl = url => /https?:\/\/[^\s]+/.test(url);

const Json = data => JSON.stringify(data, null, 2);

const runtime = seconds => {
  seconds = Math.floor(seconds);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
};

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({ url, method: "GET", ...options });
    return res.data;
  } catch {
    return null;
  }
};

const saveConfig = (key, value) => {
  if (!fs.existsSync(ENV_PATH)) fs.writeFileSync(ENV_PATH, "");

  let envData = fs.readFileSync(ENV_PATH, "utf8").split("\n");
  let found = false;

  envData = envData.map(line => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) envData.push(`${key}=${value}`);

  fs.writeFileSync(ENV_PATH, envData.join("\n"));
  require("dotenv").config({ path: ENV_PATH });
};

const dBinary = async str =>
  str.split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join("");

const eBinary = async (str = "") =>
  str.split("").map(c => c.charCodeAt(0).toString(2)).join(" ");

/* ===== Export ===== */

module.exports = {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  saveConfig,
  Catbox,
  monospace,
  dBinary,
  eBinary
};