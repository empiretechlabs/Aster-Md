const bot = require(__dirname + '/lib/client');
const { VERSION } = require(__dirname + '/config');

global.Debug = global.Debug || console;

let restartAttempts = 0;
const MAX_RESTART_DELAY = 60000;

const start = async () => {
  Debug.info(`Aster-Md ${VERSION}`);
  try {
    await bot.init();
    bot.logger.info('⏳ Database syncing!');
    await bot.DATABASE.sync();
    await bot.connect();
    restartAttempts = 0;
  } catch (error) {
    Debug.error(error);
    restartAttempts += 1;
    const delay = Math.min(5000 * restartAttempts, MAX_RESTART_DELAY);
    console.log(`Restarting in ${delay / 1000}s (attempt ${restartAttempts})...`);
    setTimeout(start, delay);
  }
};
start();
