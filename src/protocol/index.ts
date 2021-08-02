import { AliceRequest } from './alice/request';
import { AliceResponse } from './alice/response';
import { MarusyaRequest } from './marusya/request';
import { MarusyaResponse } from './marusya/response';

export type Request = AliceRequest | MarusyaRequest;
export type Response = AliceResponse | MarusyaResponse;

export function createRequest(reqBody: unknown) {
  // Important to match Marusya first!
  if (MarusyaRequest.match(reqBody)) {
    return new MarusyaRequest(reqBody);
  } else if (AliceRequest.match(reqBody)) {
    return new AliceRequest(reqBody);
  } else {
    throw new Error(`Unsupported platform: ${JSON.stringify(reqBody)}`);
  }
}

export function createResponse(request: Request) {
  if (request instanceof AliceRequest) {
    return new AliceResponse();
  } else if (request instanceof MarusyaRequest) {
    return new MarusyaResponse(request);
  } else {
    throw new Error(`Unsupported platform.`);
  }
}
