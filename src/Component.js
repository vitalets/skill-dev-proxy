module.exports = class Component {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.applicationState = state && state.application || null;
    this.response = null;
    this.resBody = null;
  }

  async run({ force } = {}) {
    if (force || this.match()) {
      await this.reply();
      this.buildResBody();
      return this.resBody;
    }
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response,
        application_state: this.applicationState,
        version: '1.0',
      };
    }
  }
};
