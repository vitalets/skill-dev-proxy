const { reply } = require('alice-renderer');
const targets = require('./targets');
const Component = require('./Component');

module.exports = class SetTarget extends Component {
  match() {
    const matches = this.request.command.match(/(установи|поставь) таргет (.+)/);
    if (!matches) {
      return;
    }
    this.requestedTargetName = matches[2].toLowerCase();
    this.target = targets.find(target => target.name.toLowerCase() === this.requestedTargetName);
    if (this.target) {
      this.applicationState = { targetName: this.target.name };
    }
    return true;
  }

  reply() {
    this.response = this.replyTargetFound() || this.replyTargetNotFound();
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
