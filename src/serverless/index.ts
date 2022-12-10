import {
  Handler,
  HttpRequest,
  sendJson,
  fixConsoleForLogging,
  getHttpBody,
} from 'yandex-cloud-fn';
import { logger } from '../logger';
import { targetManager } from '../target-manager';
import { handleUserMessage } from '../handler';
import { config } from '../config';

fixConsoleForLogging();

targetManager.init(config.targets);

export const handler: Handler<HttpRequest> = async event => {
  try {
    logger.log(event);
    if (event.httpMethod === 'GET') {
      return showTargets();
    }
    const reqBody = JSON.parse(getHttpBody(event));
    const resBody = await handleUserMessage(reqBody);
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

function attachEventToError(error: Error, event: HttpRequest) {
  error.stack += event?.body
    ? ` BODY: ${JSON.stringify(event.body)}`
    : ` EVENT: ${JSON.stringify(event)}`;
  return error;
}
