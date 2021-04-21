const { reply } = require('alice-renderer');
const BaseComponent = require('./BaseComponent');

module.exports = class ProxyToUrl extends BaseComponent {
  match() {
    return this.request.command.match(/список таргетов|покажи таргеты/);
  }

  reply() {
    const response = reply`
      Выберите таргет для проксирования
    `;
    return { response };
  }
};
