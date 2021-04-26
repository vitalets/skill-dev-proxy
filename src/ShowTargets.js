const { reply, buttons } = require('alice-renderer');
const targets = require('./targets');

module.exports = class ShowTargets {
  match() {
    return this.ctx.command.match(/список таргетов|покажи таргеты/);
  }

  reply() {
    this.ctx.response = reply`
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
