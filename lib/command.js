class Command {
  
  constructor(command, description, args=[], options=[]) {
    this.command = command;
    this.description = description;
    this.args = args;
    this.options = options;
    this.result = '';
  }

  action() {
    throw Error('Command action not implemented');
  }

  definition() {
    return {
      command: this.command,
      description: this.description,
      arguments: this.args,
      options: this.options
    };
  }

  getResult() {
    return this.result;
  }

}

module.exports = Command;