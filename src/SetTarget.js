const { reply } = require('alice-renderer');
const { findTargetByName } = require('./helpers');

module.exports = class SetTarget {
  match() {
    const matches = this.ctx.request.command.match(/(установи|поставь) (таргет|target) (.+)/);
    if (!matches) {
      return;
    }
    this.requestedTargetName = matches[3];
    this.target = findTargetByName(this.requestedTargetName);
    if (this.target) {
      this.ctx.state.targetName = this.target.name;
    }
    return true;
  }

  reply() {
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
