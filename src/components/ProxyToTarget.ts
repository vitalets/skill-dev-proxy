import Timeout from 'await-timeout';
import { targetManager } from '../target-manager';
import { logger } from '../logger';
import { proxyWs } from '../proxy/ws';
import { proxyHttp } from '../proxy/http';
import { Component } from './Component';

export class ProxyToTarget extends Component {
  static TIMEOUT = 2800;

  match() {
    return Boolean(targetManager.selectedTarget);
  }

  async reply() {
    this.ctx.resBody = await Timeout.wrap(
      this.proxyRequest(),
      ProxyToTarget.TIMEOUT,
      `Таймаут таргета ${targetManager.selectedTarget!.name}`
    );
    if (!this.ctx.resBody) throw new Error(`Пустой ответ.`);
  }

  async proxyRequest() {
    const { name, url } = targetManager.selectedTarget!;
    logger.log(`PROXY TO TARGET: ${name}`);
    return url === 'websocket'
      ? await proxyWs(this.ctx.reqBody)
      : await proxyHttp(url, this.ctx.reqBody);
  }
}
