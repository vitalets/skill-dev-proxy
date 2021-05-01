import { reply } from 'alice-renderer';
import { targetManager, Target } from '../targets';
import { Component } from './Component';

export class SetTarget extends Component {
  requestedTargetName?: string;
  target?: Target;

  match() {
    const matches = this.ctx.request.command.match(/(установи|поставь) (таргет|target) (.+)/);
    if (!matches) {
      return false;
    }
    this.requestedTargetName = matches[3];
    this.target = targetManager.findByName(this.requestedTargetName);
    if (this.target) {
      this.ctx.state.targetName = this.target.name;
    }
    return true;
  }

  async reply() {
    this.ctx.response = this.replyTargetFound() || this.replyTargetNotFound();
  }

  replyTargetFound() {
    if (this.target) {
      return reply`
        Выбран таргет ${this.target.name}.
      `;
    }
  }

  replyTargetNotFound() {
    return reply`
      Таргет ${this.requestedTargetName} не найден.
    `;
  }
};
