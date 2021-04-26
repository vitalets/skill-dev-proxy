module.exports = class Ctx {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = state && state.application || {};
    this.response = null;
    this.resBody = null;

    this.command = this.request.command;
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response,
        version: '1.0',
      };
    }

    if (Object.keys(this.state).length > 0) {
      this.resBody.application_state = Object.assign({}, this.resBody.application_state, this.state);
    }
  }
};
