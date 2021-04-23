const { reply } = require('alice-renderer');
const Component = require('./Component');

module.exports = class PingPong extends Component {
  match() {
    return this.request.command === 'ping';
  }

  reply() {
    this.response = reply`pong`;
  }
};
