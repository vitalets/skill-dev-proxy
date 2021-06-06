import Timeout from 'await-timeout';
import { Target, targetManager } from '../targets';
import { logger } from '../logger';
import { proxy } from '../proxy';
import { Component } from './Component';

export class ProxyToTarget extends Component {
  static TIMEOUT = 2800;
  target?: Target;

  match() {
    if (this.ctx.targetName) {
      this.target = targetManager.findInString(this.ctx.targetName);
      return Boolean(this.target);
    }
  }

  async reply() {
    await Timeout.wrap(this.proxyRequest(), ProxyToTarget.TIMEOUT, `Таймаут таргета ${this.target!.name}`);
  }

  async proxyRequest() {
    const { name, url } = this.target!;
    logger.log(`PROXY TO TARGET: ${name}`);
    this.ctx.resBody = await proxy(url, this.ctx.reqBody);
  }
}
