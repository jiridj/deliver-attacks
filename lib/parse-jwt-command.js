const Command = require('./command');

class ParseJWT extends Command {
  constructor() {
    super(
      'parse-jwt',
      'Parse the JWT token and print out its content.',
      [
        [ '<token>', 'The JWT token to parse.']
      ]
    );
  }

  action(token) {
    const parts = token.split('.');
    
    if (parts.length == 3) {
      console.log(`HEADER:\n${this.decodeB64(parts[0])}`);
      console.log(`PAYLOAD:\n${this.decodeB64(parts[1])}`);
    } else {
      console.error(`Unable to parse token`);
    }
  }

  decodeB64(str) {
    const buffer = Buffer.from(str, 'base64');
    const obj = JSON.parse(buffer.toString());
    return JSON.stringify(obj, null, 2);
  }
}

module.exports = ParseJWT;