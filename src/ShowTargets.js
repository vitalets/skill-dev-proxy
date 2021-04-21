const { reply, buttons } = require('alice-renderer');
const targets = require('./targets');
const BaseComponent = require('./BaseComponent');

module.exports = class ShowTargets extends BaseComponent {
  match() {
    const targetName = this.state?.application?.targetName;
    return !targetName
      || targets.every(target => target.name !== targetName)
      || this.request.command.match(/список таргетов|покажи таргеты/);
  }

  reply() {
    this.response = reply`
      Выберите таргет:
      ${buttons(this.buttons())}
    `;
  }

  buttons() {
    return targets.map(target => {
      return {
        title: `Установи таргет ${target.name}`,
        hide: false
      };
    });
  }
};
