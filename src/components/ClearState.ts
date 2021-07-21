import { Component } from './Component';
import { reply } from 'alice-renderer';

export class ClearState extends Component {
  match() {
    return /(сбрось|сбросить|очистить) (стейт|стейк)/.test(this.ctx.userMessage);
  }

  async reply() {
    this.ctx.resBody.application_state = {};
    return reply`Стейт сброшен.`;
  }
}
