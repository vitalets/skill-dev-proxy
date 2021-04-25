const { reply, text, tts } = require('alice-renderer');
const Timeout = require('await-timeout');
const logger = require('./logger');
const targets = require('./targets');
const Component = require('./Component');

const TARGET_TYPES = {
  http: require('./target-types/http'),
  amqp: require('./target-types/amqp'),
};

class ProxyToTarget extends Component {
  match() {
    const targetName = this.applicationState?.targetName?.toLowerCase();
    this.target = targets.find(target => target.name.toLowerCase() === targetName);
    return Boolean(this.target);
  }

  async reply() {
    try {
      await Timeout.wrap(
        this.proxyRequest(),
        ProxyToTarget.TIMEOUT,
        `Таймаут таргета ${this.target.name}`
      );
    } catch (e) {
      this.replyError(e);
    }
  }

  async proxyRequest() {
    logger.log(`PROXY TO TARGET: ${this.target.name}`);
    const protocol = new URL(this.target.url).protocol.replace(/s?:$/, '');
    const { proxy } = TARGET_TYPES[protocol];
    this.resBody = await proxy({ url: this.target.url, reqBody: this.reqBody });
  }

  replyError(e) {
    logger.log(e);
    const message = e.stack.split('\n').slice(0, 2).join('\n');
    this.response = reply`
      ${tts('Ошибка')}
      ${text(message)}
    `;
  }
}

// webpack can't parse static class props out of box.
// So use this assignment instead of installing babel-loader and complexify configuration.
ProxyToTarget.TIMEOUT = 2800;

module.exports = ProxyToTarget;
