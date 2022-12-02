import {
  Handler,
  HttpRequest,
  sendJson,
  fixConsoleForLogging,
} from 'yandex-cloud-fn';

export interface ReqInfo {
  requestId: string;
  appVersion: string;
  iamToken: string;
  logLevel?: string;
  isProxy?: boolean;
}

fixConsoleForLogging();

export const handler: Handler<HttpRequest> = async (event, context) => {
  try {
    const resBody = { event, context };
    return sendJson(resBody);
  } catch (e) {
    throw attachEventToError(e, event);
  }
};

function attachEventToError(error: Error, event: HttpRequest) {
  error.stack += event?.body
    ? ` BODY: ${JSON.stringify(event.body)}`
    : ` EVENT: ${JSON.stringify(event)}`;
  return error;
}
