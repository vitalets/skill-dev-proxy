const { reply } = require('alice-renderer');

module.exports = class PingPong {
  match() {
    return this.ctx.command === 'ping';
  }

  reply() {
    this.ctx.response = reply`pong`;
  }
};
