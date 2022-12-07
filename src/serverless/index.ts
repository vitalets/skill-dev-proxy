import {
  Handler,
  HttpRequest,
  WebsocketRequest,
  sendJson,
  fixConsoleForLogging,
  isWebsocketRequest,
  getHttpBody,
} from 'yandex-cloud-fn';
import { logger } from '../logger';
import { targetManager } from '../target-manager';
import { handleUserMessage } from '../handler';
import { config } from '../config';

fixConsoleForLogging();

targetManager.init(config.targets);

export const handler: Handler<HttpRequest | WebsocketRequest> = async event => {
  try {
    logger.log(event);
    const res = isWebsocketRequest(event)
      ? await handleWebsocketRequest(event)
      : await handleHttpRequest(event);
    return res;
  } catch (e) {
    throw attachEventToError(e, event);
  }
};

async function handleWebsocketRequest(event: WebsocketRequest) {
  switch (event.requestContext.eventType) {
    case 'CONNECT':
      // replace connectionId in ydb
    break;
    case 'MESSAGE':
      // send msg to connectionId and wait response
    break;
    case 'DISCONNECT':
      // remove connectionId in ydb
    break;
  }

  logger.log('ws body:', getHttpBody(event));
  return { statusCode: 200 };
}

async function handleHttpRequest(event: HttpRequest) {
  if (event.httpMethod === 'GET') {
    return showTargets();
  }
  const reqBody = JSON.parse(getHttpBody(event));
  const resBody = await handleUserMessage(reqBody);
  return sendJson(resBody);
}

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

function attachEventToError(error: Error, event: HttpRequest) {
  error.stack += event?.body
    ? ` BODY: ${JSON.stringify(event.body)}`
    : ` EVENT: ${JSON.stringify(event)}`;
  return error;
}
