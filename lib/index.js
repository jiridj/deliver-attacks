const fs = require('fs');
const path = require('path');

const normalizedPath = path.join(__dirname, './');

const commands = fs.readdirSync(normalizedPath)
  .filter(file => file.match(/[a-zA-Z]+-command.js/))
  .map((file) => {
    //console.log(`Loading command ${file}`);
    const c = require('./' + file);
    return new c();
  });

module.exports = commands;