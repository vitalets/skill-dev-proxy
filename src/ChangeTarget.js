const { reply } = require('alice-renderer');
const targets = require('./targets');
const BaseComponent = require('./BaseComponent');

module.exports = class ChangeTarget extends BaseComponent {
  match() {
    // return this.request.command.match(/список таргетов|покажи таргеты/);
  }

  reply() {
    const response = reply`
      Выберите таргет для проксирования
    `;
    return { response };
  }
};
