import { createRequest, createResponse } from 'uni-skill';
import { normalizeUserMessage } from './utils';

export class Ctx {
  request: ReturnType<typeof createRequest>;
  response: ReturnType<typeof createResponse>;
  userMessage: string;

  constructor(reqBody: unknown) {
    this.request = createRequest(reqBody);
    this.response = createResponse(this.request);
    this.userMessage = normalizeUserMessage(this.request.userMessage);
  }
}
