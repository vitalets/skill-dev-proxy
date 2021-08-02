import { Request, Response, createRequest, createResponse } from './protocol';
import { normalizeUserMessage } from './utils';

export class Ctx {
  request: Request;
  response: Response;
  userMessage: string;

  constructor(reqBody: unknown) {
    this.request = createRequest(reqBody);
    this.response = createResponse(this.request);
    this.userMessage = normalizeUserMessage(this.request.userMessage);
  }
}
