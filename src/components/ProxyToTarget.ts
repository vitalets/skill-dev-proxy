import { targetManager } from '../target-manager';
import { proxyRequest } from '../proxy';
import { Component } from './Component';

export class ProxyToTarget extends Component {
  static TIMEOUT = 2800;

  match() {
    return Boolean(this.ctx.state.selectedTarget);
  }

  async reply() {
    const target = targetManager.getTarget(this.ctx.state.selectedTarget!);
    this.ctx.response.body = await proxyRequest(target, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.ctx.request.body),
    }, { timeout: ProxyToTarget.TIMEOUT });
  }
}
