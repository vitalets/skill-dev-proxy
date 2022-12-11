import { createRequest, createResponse } from 'uni-skill';
import { ReqInfo } from './handler';
import { State } from './state';
import { normalizeUserMessage } from './utils';

export class Ctx {
  request: ReturnType<typeof createRequest>;
  response: ReturnType<typeof createResponse>;
  userMessage: string;
  stateManager: State;

  constructor(reqBody: unknown, public reqInfo: ReqInfo) {
    this.request = createRequest(reqBody);
    this.response = createResponse(this.request);
    this.userMessage = normalizeUserMessage(this.request.userMessage);
    this.stateManager = new State(this);
  }

  get state() {
    return this.stateManager.data;
  }
}
