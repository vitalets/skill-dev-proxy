import { reply, buttons } from 'alice-renderer';
import { targetManager } from '../target-manager';
import { Component } from './Component';

export class ShowTargets extends Component {
  match() {
    return /(список|покажи) (таргетов|таргеты)/.test(this.ctx.userMessage);
  }

  async reply() {
    return reply`
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
