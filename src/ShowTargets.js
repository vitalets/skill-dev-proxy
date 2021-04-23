const { reply, buttons } = require('alice-renderer');
const targets = require('./targets');
const Component = require('./Component');

module.exports = class ShowTargets extends Component {
  match() {
    return this.request.command.match(/список таргетов|покажи таргеты/);
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
