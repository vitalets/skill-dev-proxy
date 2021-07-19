import { reply, buttons } from 'alice-renderer';
import { targetManager } from '../target-manager';
import { Component } from './Component';

export class ShowTargets extends Component {
  match() {
    return Boolean(this.ctx.userMessage.match(/(список|покажи) (таргетов|таргеты)/));
  }

  async reply() {
    this.ctx.response = reply`
      Выберите таргет:
      ${this.buttons()}
    `;
  }

  buttons() {
    const items = targetManager.targets.map(target => {
      return {
        title: target.name,
        hide: false
      };
    });
    return buttons(items);
  }
}
