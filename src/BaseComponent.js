module.exports = class BaseComponent {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = state;
    this.response = null;
    this.resBody = null;
  }

  async run() {
    if (this.match()) {
      await this.reply();
      this.buildResBody();
      return this.resBody;
    }
  }

  buildResBody() {
    this.resBody = {
      response: this.response,
      state: this.state,
      version: '1.0'
    };
  }
};
