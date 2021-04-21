const { reply } = require('alice-renderer');
const targets = require('./targets');
const BaseComponent = require('./BaseComponent');

module.exports = class SetTarget extends BaseComponent {
  match() {
    const matches = this.request.command.match(/(установи|поставь) таргет (.+)/);
    if (!matches) {
      return;
    }
    this.requestedTargetName = matches[2];
    this.foundTarget = targets.find(target => target.name === this.requestedTargetName);
    if (this.foundTarget) {
      this.state = this.state || {};
      this.state.application = {
        targetName: this.foundTarget.name
      };
    }
    return true;
  }

  reply() {
    this.response = this.replyTargetFound() || this.replyTargetNotFound();
  }

  replyTargetFound() {
    if (this.foundTarget) {
      return reply`
        Выбран таргет ${this.foundTarget.name}.
        Следующие запросы пойдут на него.
      `;
    }
  }

  replyTargetNotFound() {
    return reply`
      Таргет ${this.requestedTargetName} не найден.
    `;
  }
};
