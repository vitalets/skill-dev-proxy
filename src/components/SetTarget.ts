import { reply, buttons } from 'alice-renderer';
import { targetManager } from '../target-manager';
import { logger } from '../logger';
import { Component } from './Component';

export class SetTarget extends Component {
  match() {
    const target = targetManager.matchTarget(this.ctx.userMessage);
    if (target) {
      logger.log(`SET TARGET: ${target.name}`);
      targetManager.selectedTarget = target;
      return true;
    }
  }

  async reply() {
    return reply`
      Выбран таргет ${targetManager.selectedTarget!.name}.
      ${buttons([ 'Поехали' ])}
    `;
  }
}
