import { ReqBody, ResBody, Response } from 'alice-types';
import { normalizeUserMessage } from './utils';

export class Ctx {
  reqBody: ReqBody;
  targetName = '';
  resBody?: ResBody;
  response?: Response;
  userMessage: string;

  constructor(reqBody: ReqBody) {
    this.reqBody = reqBody;
    this.userMessage = normalizeUserMessage(this.request.command);
  }

  get request() {
    return this.reqBody.request;
  }

  get session() {
    return this.reqBody.session;
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response!,
        version: '1.0',
      };
    }
  }
}
