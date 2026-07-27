/**
 * Copyright (C) 2026
 * Licensed under the GPL-3.0 License;
 * You may not use this file except in compliance with the License.
 * It is supplied in the hope that it may be useful.
 *
 * @project_name Empire-Md
 * @author      efeurhobobullish <https://github.com/efeurhobobullish>
 * @description Empire-Md, a multi-functional WhatsApp bot.
 * @version     0.0.2
 */

const fs = require('fs-extra');

if (fs.existsSync('.env')) {
  require('dotenv').config({ path: __dirname + '/.env' });
}

module.exports = {
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || 'false',
  ANTICALL: process.env.ANTICALL || 'false',
  ANTICALL_MSG: process.env.ANTICALL_MSG || '🚫 Calls are not allowed.',
  ANTIFAKE: process.env.ANTIFAKE || 'false',
  ANTIFAKE_ACTION: process.env.ANTIFAKE_ACTION || 'kick',
  ANTIFAKE_NUMBERS: process.env.ANTIFAKE_NUMBERS || '91,222,92',
  ANTILINK: process.env.ANTILINK || 'false',
  ANTILINK_ACTION: process.env.ANTILINK_ACTION || 'delete',
  ANTIDELETE: process.env.ANTIDELETE || 'false',
  AUTOREACT: process.env.AUTOREACT || 'false',
  AUTO_LIKE_EMOJI: process.env.AUTO_LIKE_EMOJI || '😀',
  AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'false',
  AUTO_RECORDING: process.env.AUTO_RECORDING || 'false',
  AUTO_TYPING: process.env.AUTO_TYPING || 'false',
  AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'false',
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || '',
  MODE: process.env.MODE || 'private',
  MONGODB_URL: process.env.MONGODB_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  OWNER_NAME: process.env.OWNER_NAME || 'Empire Tech',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '212782547789',
  PREFIX: process.env.PREFIX || '.',
  SESSION_ID: process.env.SESSION_ID || 'iBhGCLLB#3n-7CaTibCX-ACmf2le2Y0HzMGP7udzH4NiLLDRp7H4',
  SUDO: process.env.SUDO || '',
  TIME_ZONE: process.env.TIME_ZONE || 'Africa/Lagos',
  VERSION: process.env.VERSION || '0.0.2-developement-x',
};
