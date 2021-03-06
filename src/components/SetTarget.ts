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
      this.clearState();
      return true;
    }
  }

  async reply() {
    return reply`
      Выбран таргет ${targetManager.selectedTarget!.name}.
      ${buttons([ 'Поехали' ])}
    `;
  }

  /**
   * Clear state on change target as states from different targets can break each other
   */
  private clearState() {
    if ('sessionState' in this.ctx.response) this.ctx.response.sessionState = {};
    if ('userState' in this.ctx.response) this.ctx.response.userState = {};
    if ('applicationState' in this.ctx.response) this.ctx.response.applicationState = {};
  }
}
