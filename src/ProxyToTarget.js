const { reply, text, tts } = require('alice-renderer');
const Timeout = require('await-timeout');
const logger = require('./logger');
const { findTargetByName } = require('./helpers');

const TARGET_TYPES = {
  http: require('./target-types/http'),
  amqp: require('./target-types/amqp'),
};

class ProxyToTarget {
  match() {
    this.target = findTargetByName(this.ctx.state.targetName);
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
    this.ctx.resBody = await proxy({ url: this.target.url, reqBody: this.ctx.reqBody });
  }

  replyError(e) {
    logger.log(e);
    const message = e.stack.split('\n').slice(0, 2).join('\n');
    this.ctx.response = reply`
      ${tts('Ошибка')}
      ${text(message)}
    `;
  }
}

// webpack can't parse static class props out of box.
// So use this assignment instead of installing babel-loader and complexify configuration.
ProxyToTarget.TIMEOUT = 2800;

module.exports = ProxyToTarget;
