const { reply } = require('alice-renderer');
const BaseComponent = require('./BaseComponent');

module.exports = class PingPong extends BaseComponent {
  match() {
    return this.request.command === 'ping';
  }

  reply() {
    this.response = reply`pong`;
  }
};
