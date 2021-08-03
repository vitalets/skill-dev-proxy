import { reply, buttons } from 'alice-renderer';
import { Component } from './Component';

export class ClearState extends Component {
  match() {
    return /(сбрось|сбросить|очистить) (стейт|стейк)/.test(this.ctx.userMessage);
  }

  async reply() {
    if (this.ctx.response.isSber()) {
      return this.replyNotSupported();
    } else {
      this.clearApplicationState();
      this.clearUserState();
      return this.replyStateCleared();
    }
  }

  clearApplicationState() {
    if (this.ctx.response.isAlice()) {
      this.ctx.response.applicationState = {};
    }
  }

  clearUserState() {
    if (this.ctx.request.isSber() || this.ctx.response.isSber()) return;
    const state = this.ctx.request.userState;
    if (state) {
      this.ctx.response.userState = {};
      for (const key of Object.keys(state)) {
        this.ctx.response.userState![key] = null;
      }
    }
  }

  replyStateCleared() {
    return reply`
      Стейт очищен.
      ${buttons([ 'Поехали' ])}
    `;
  }

  replyNotSupported() {
    return reply`
      На данной платформе стейта нет.
    `;
  }
}
