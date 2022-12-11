import { reply, buttons } from 'alice-renderer';
import { Target, targetManager } from '../target-manager';
import { logger } from '../logger';
import { Component } from './Component';

export class SetTarget extends Component {
  target?: Target;

  match() {
    this.target = targetManager.matchTarget(this.ctx.userMessage);
    if (this.target) {
      logger.log(`SET TARGET: ${this.target.name}`);
      this.ctx.state.selectedTarget = this.target.name;
      this.clearState();
      return true;
    }
  }

  async reply() {
    return reply`
      Выбран таргет ${this.target!.name}.
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
