const { reply, text, tts } = require('alice-renderer');
const Timeout = require('await-timeout');
const getFetch = () => require('node-fetch');
const logger = require('./logger');
const targets = require('./targets');
const Component = require('./Component');

class ProxyToTarget extends Component {
  match() {
    const targetName = this.applicationState?.targetName;
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
    if (this.isQueueTarget()) {
      await this.proxyToQueue();
    } else {
      await this.proxyToUrl();
    }
  }

  isQueueTarget() {
    return this.target.url.startsWith(ProxyToTarget.QUEUE_URL_PREFIX);
  }

  async proxyToUrl() {
    const fetch = getFetch();
    const method = 'POST';
    const url = this.target.url;
    logger.log(`PROXY TO: ${url}`);
    const body = JSON.stringify(this.reqBody);
    const response = await fetch(url, { method, body });
    if (response.ok) {
      this.resBody = await response.json();
    } else {
      const message = [response.status, response.statusText, await response.text()].filter(Boolean).join(' ');
      throw new Error(message);
    }
  }

  async proxyToQueue() {

  }

  replyError(e) {
    logger.log(e);
    this.response = reply`
      ${tts('Ошибка')}
      ${text(e.message)}
    `;
  }
}

// webpack can't parse static class props out of box.
// So use this assignment instead of installing babel-loader and complexify configuration.
ProxyToTarget.QUEUE_URL_PREFIX = 'https://message-queue.api.cloud.yandex.net';
ProxyToTarget.TIMEOUT = 2800;

module.exports = ProxyToTarget;
