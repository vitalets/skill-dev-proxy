import {
  Handler,
  HttpRequest,
  sendJson,
  fixConsoleForLogging,
  getHttpBody,
  Context,
} from 'yandex-cloud-fn';
import { logger } from '../logger';
import { targetManager } from '../target-manager';
import { handleUserMessage, ReqInfo } from '../handler';
import { config } from '../config';

fixConsoleForLogging();

targetManager.init(config.targets);

export const handler: Handler<HttpRequest> = async (event, context) => {
  try {
    logger.log(event);
    if (event.httpMethod === 'GET') {
      return showTargets();
    }
    const reqInfo = getReqInfo(context);
    const reqBody = JSON.parse(getHttpBody(event));
    const resBody = await handleUserMessage(reqBody, reqInfo);
    return sendJson(resBody);
  } catch (e) {
    throw attachEventToError(e, event);
  }
};

function showTargets() {
  const targetNames = targetManager.targets.map(target => target.name).join(', ');
  return {
    statusCode: 200,
    body: `Работает. Таргеты: ${targetNames}`,
    headers: {
      'Content-Type': 'text/plain; charset="UTF-8"'
    }
  };
}

function getReqInfo(context: Context): ReqInfo {
  return {
    reqId: context.requestId,
    functionId: context.functionName,
    iamToken: context.token?.access_token || '',
  };
}

function attachEventToError(error: Error, event: HttpRequest) {
  error.stack += event?.body
    ? ` BODY: ${JSON.stringify(event.body)}`
    : ` EVENT: ${JSON.stringify(event)}`;
  return error;
}
