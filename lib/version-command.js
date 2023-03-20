const fs = require('fs');

const Command = require('./command');

class Version extends Command {
  constructor() {
    super(
      'version',
      'Prints the version of the DELIVER command-line interface.'
    );

    this.pkg = JSON.parse(fs.readFileSync('./package.json'));
  }

  action(str, options) {
    console.log(`DELIVER ATTACKS ${this.pkg.version}`);
  }
}

module.exports = Version;