#! /usr/bin/env node

const figlet = require('figlet');
const program = require('commander');

function setupCli() {
  console.log(figlet.textSync('DELIVER', {
    font: 'Doom'
  }));

  const commands = require('./lib/index');  
  commands.forEach(c => {
    const cdef = c.definition();

    const command = program
      .command(cdef.command)
      .description(cdef.description);

    cdef.arguments.forEach(arg => {
      command.argument(arg[0], arg[1]);
    });

    cdef.options.forEach(opt => {
      command.option([opt[0], opt[1]].join(','), opt[2], opt[3]);
    });

    command.action(function () {
      c.action.apply(c, arguments);
      console.log(c.getResult());
    });
  });
}

setupCli();
program.parse();
