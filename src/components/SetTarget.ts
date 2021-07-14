import { reply } from 'alice-renderer';
import { targetManager, Target } from '../targets';
import { Component } from './Component';
import { close as closeAmqpConnection } from '../proxy/amqp';

export class SetTarget extends Component {
  target?: Target;

  match() {
    this.target = targetManager.findInString(this.ctx.request.command);
    if (this.target) {
      this.ctx.targetName = this.target.name;
      return true;
    }
  }

  async reply() {
    // закрываем amqp коннект при смене таргета
    await closeAmqpConnection();
    this.ctx.response = reply`
      Выбран таргет ${this.target!.name}.
    `;
  }
}
