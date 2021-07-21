import { ReqBody, ResBody } from 'alice-types';
import { normalizeUserMessage } from './utils';

export class Ctx {
  resBody: ResBody = {
    response: { text: '', end_session: false },
    version: '1.0',
  };
  userMessage: string;

  constructor(public reqBody: ReqBody) {
    this.userMessage = normalizeUserMessage(this.request.command);
  }

  get request() {
    return this.reqBody.request;
  }

  get session() {
    return this.reqBody.session;
  }
}
