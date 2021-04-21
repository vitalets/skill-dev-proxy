module.exports = class BaseComponent {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = state;
    this.resBody = null;
  }

  async run() {
    if (this.match()) {
      this.resBody = await this.reply();
      this.resBody.version = '1.0';
      return this.resBody;
    }
  }
};
