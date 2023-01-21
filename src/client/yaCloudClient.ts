/**
 * Yandex Cloud fn client for debugging skills on localhost.
 */
import { proxyHttp } from '../proxy/http';
import { Defaults } from '../utils';
import { createLogger, Logger, LogLevelNames } from '../logger';
import { WsClient } from '../proxy/cloud-fn/ws-client';
import { config } from '../config';
import { WsRequest, WsResponse } from '../proxy/cloud-fn/types';
import { sendToConnection } from '../proxy/cloud-fn/ws-apigw';

// todo: create Common Client class

export interface YaCloudClientOptions {
  wsUrl: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  handler: string | Function;
  logLevel?: LogLevelNames;
}

const defaults: Defaults<YaCloudClientOptions> = {
  logLevel: 'debug',
};

export class YaCloudClient {
  options: Required<YaCloudClientOptions>;
  logger: Logger;
  wsClient: WsClient;

  constructor(options: YaCloudClientOptions) {
    this.options = Object.assign({}, defaults, options);
    this.assertOptions();
    this.logger = createLogger({ level: this.options.logLevel });
    this.wsClient = new WsClient(this.options.wsUrl, {
      'X-Stub-Id': config.stubId,
    });
  }

  async run() {
    await this.wsClient.ensureConnected();
    this.waitRequests();
  }

  async close() {
    await this.wsClient.close();
  }

  protected async waitRequests() {
    this.logger.log(`Waiting requests...`);
    this.wsClient.onJsonMessage = async message => {
      this.logger.debug(`\nREQUEST: ${message.payload}`);
      if (message.type !== 'request') return;
      const resBody = await this.getResBody(message.payload);
      const resBodyStr = JSON.stringify(resBody);
      this.logger.debug(`RESPONSE: ${resBodyStr}`);
      await this.sendResponse(message, resBodyStr);
    };
  }

  private async getResBody(message: string) {
    try {
      // todo: преобразовывать весь запрос в json { method, headers, body }
      const reqBody = JSON.parse(message);
      const resBody = await this.callHandler(reqBody);
      if (!resBody) throw new Error(`Empty response from handler.`);
      return resBody;
    } catch (e) {
      this.logger.error(e);
      return buildErrorResponse(e);
    }
  }

  protected async sendResponse(request: WsRequest, resBody: string) {
    const response: WsResponse = {
      type: 'response',
      reqId: request.reqId,
      payload: resBody,
    };
    await sendToConnection(request.replyConnectionId, response, request.token);
  }

  private async callHandler(reqBody: unknown) {
    const { handler } = this.options;
    return typeof handler === 'function'
      ? handler(reqBody)
      : proxyHttp(handler, { method: 'POST', body: JSON.stringify(reqBody) });
  }

  private assertOptions() {
    if (!this.options.wsUrl) throw new Error(`Empty wsUrl`);
    if (!this.options.handler) throw new Error(`Empty handler`);
  }
}

function buildErrorResponse(e: Error) {
  const error = (e.stack || e.message).split('\n').slice(0, 2).join('\n');
  return { error };
}
