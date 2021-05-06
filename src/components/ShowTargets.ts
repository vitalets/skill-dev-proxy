import { reply, buttons } from 'alice-renderer';
import { targetManager } from '../targets';
import { Component } from './Component';

export class ShowTargets extends Component {
  match() {
    return Boolean(this.ctx.msg.match(/список таргетов|покажи таргеты/));
  }

  async reply() {
    this.ctx.response = reply`
      Выберите таргет:
      ${buttons(this.buttons())}
    `;
  }

  buttons() {
    return targetManager.targets.map(target => {
      return {
        title: `Установи таргет ${target.name}`,
        hide: false
      };
    });
  }
}
