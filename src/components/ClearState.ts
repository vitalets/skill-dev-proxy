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
    this.ctx.resBody.application_state = {};
  }

  clearUserState() {
    const state = this.ctx.reqBody.state?.user;
    if (state) {
      this.ctx.resBody.user_state_update = {};
      Object.keys(state).forEach(key => {
        this.ctx.resBody.user_state_update![key] = null;
      });
    }
  }
}
