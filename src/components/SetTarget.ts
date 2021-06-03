import { reply } from 'alice-renderer';
import { targetManager, Target } from '../targets';
import { Component } from './Component';

export class SetTarget extends Component {
  target?: Target;

  match() {
    this.target = targetManager.findInString(this.ctx.request.command);
    if (this.target) {
      this.ctx.state.targetName = this.target.name;
      return true;
    }
  }

  async reply() {
    this.ctx.response = reply`
      Выбран таргет ${this.target!.name}.
    `;
  }
}
