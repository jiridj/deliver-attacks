const Command = require('./command');

class Test extends Command {
  constructor() {
    super(
      'test',
      'This is a test command.',
      [ 
        ['<something>', 'An argument'] 
      ],
      [
        [
          '-o', '--option <input>', 'an option with input'
        ]
      ]
    );
  }

  action(str, options) {
    console.log(`test got ${str} and options ${JSON.stringify(options)}`);
  }
}

module.exports = Test;