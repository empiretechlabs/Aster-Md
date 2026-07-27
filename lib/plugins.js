var config = require('../config');
var commands = [];

function cmd(commandInfo, handlerFunction) {
  commandInfo["function"] = handlerFunction;
  
  if (!commandInfo.pattern && commandInfo.cmdname) {
    commandInfo.pattern = commandInfo.cmdname;
  }
  if (!commandInfo.alias) {
    commandInfo.alias = [];
  }
  if (!commandInfo.dontAddCommandList) {
    commandInfo.dontAddCommandList = false;
  }
  if (!commandInfo.desc) {
    commandInfo.desc = commandInfo.info ? commandInfo.info : '';
  }
  if (!commandInfo.fromMe) {
    commandInfo.fromMe = false;
  }
  if (!commandInfo.category) {
    commandInfo.category = commandInfo.type ? commandInfo.type : "misc";
  }
  
  commandInfo.info = commandInfo.desc;
  commandInfo.type = commandInfo.category;
  
  if (!commandInfo.use) {
    commandInfo.use = '';
  }
  if (!commandInfo.filename) {
    commandInfo.filename = "Not Provided";
  }
  
  commands.push(commandInfo);
  return commandInfo;
}

const Module = {
  'export': cmd
};

module.exports = {
  'cmd': cmd,
  'AddCommand': cmd,
  'Function': cmd,
  'Module': Module,
  'smd': cmd,
  'commands': commands,
  'bot': cmd
};