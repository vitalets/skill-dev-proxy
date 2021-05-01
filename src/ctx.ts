import { ReqBody, Request, Session, ResBody, Response } from 'alice-types';

type State = Record<string, any>;

export class Ctx {
  reqBody: ReqBody;
  request: Request;
  session: Session;
  state: State;
  resBody?: ResBody;
  response?: Response;
  command: string;

  constructor(reqBody: ReqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = (state && state.application || {}) as State;
    this.command = this.request.command;
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response!,
        version: '1.0',
      };
    }

    if (Object.keys(this.state as object).length > 0) {
      this.resBody.application_state = Object.assign({}, this.resBody.application_state, this.state);
    }
  }
};
