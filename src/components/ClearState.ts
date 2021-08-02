import { reply, buttons } from 'alice-renderer';
import { Component } from './Component';

export class ClearState extends Component {
  match() {
    return /(сбрось|сбросить|очистить) (стейт|стейк)/.test(this.ctx.userMessage);
  }

  async reply() {
    this.clearApplicationState();
    this.clearUserState();
    return reply`
      Стейт очищен.
      ${buttons([ 'Поехали' ])}
    `;
  }

  clearApplicationState() {
    if (this.ctx.response.isAlice()) {
      this.ctx.response.applicationState = {};
    }
  }

  clearUserState() {
    const state = this.ctx.request.userState;
    if (state) {
      this.ctx.response.userState = {};
      Object.keys(state).forEach(key => {
        this.ctx.response.userState![key] = null;
      });
    }
  }
}
