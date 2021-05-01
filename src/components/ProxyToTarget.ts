import { reply, text, tts } from 'alice-renderer';
import Timeout from 'await-timeout';
import { Target, targetManager } from '../targets';
import { logger } from '../logger';
import { proxy } from '../proxy';
import { Component } from './Component';

export class ProxyToTarget extends Component {
  static TIMEOUT = 2800;
  target?: Target;

  match() {
    this.target = targetManager.findByName(this.ctx.state.targetName);
    return Boolean(this.target);
  }

  async reply() {
    try {
      await Timeout.wrap(
        this.proxyRequest(),
        ProxyToTarget.TIMEOUT,
        `Таймаут таргета ${this.target!.name}`
      );
    } catch (e) {
      this.replyError(e);
    }
  }

  async proxyRequest() {
    const { name, url } = this.target!;
    logger.log(`PROXY TO TARGET: ${name}`);
    this.ctx.resBody = await proxy(url, this.ctx.reqBody);
  }

  replyError(e: Error) {
    logger.error(e);
    const message = e.stack!.split('\n').slice(0, 2).join('\n');
    this.ctx.response = reply`
      ${tts('Ошибка')}
      ${text(message)}
    `;
  }
}
