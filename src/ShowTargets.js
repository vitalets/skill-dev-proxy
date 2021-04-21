const { reply, buttons } = require('alice-renderer');
const targets = require('./targets');
const BaseComponent = require('./BaseComponent');

module.exports = class ShowTargets extends BaseComponent {
  match() {
    const targetName = this.state?.application?.targetName;
    return !targetName
      || targets.every(target => target.name !== targetName)
      || this.request.command.match(/список таргетов|покажи таргеты/)
  }

  reply() {
    const response = reply`
      Выберите таргет для проксирования:
      ${buttons(this.replyButtons())}
    `;
    return { response };
  }

  replyButtons() {
    return targets.map(target => ({ title: target.name, hide: false }));
  }
};
