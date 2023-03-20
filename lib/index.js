const fs = require('fs');
const path = require('path');

const normalizedPath = path.join(__dirname, './');
console.log(normalizedPath);

const tmp = fs.readdirSync(normalizedPath);
console.log(JSON.stringify(tmp));

const commands = fs.readdirSync(normalizedPath)
  .filter(file => file.match(/[a-zA-Z]+-command.js/))
  .map((file) => {
    console.log(file);
    const c = require('./' + file);
    return new c();
  });

module.exports = commands;