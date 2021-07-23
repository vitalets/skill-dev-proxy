/**
 * Client library for debugging skills on localhost.
 * Uses websocket.
 */
import { once } from 'events';
import { client as WSClient, connection as Connection } from 'websocket';
import { proxyHttp } from './proxy/http';
import { Defaults } from './utils';
import { createLogger, Logger } from './logger';
import { ReqBody } from 'alice-types';

export interface ClientOptions {
  wsUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: string | ((...args: any[]) => any);
  logging?: boolean;
}

const defaults: Defaults<ClientOptions> = {
  logging: true,
};

export class Client {
  options: Required<ClientOptions>;
  logger: Logger;
  ws: WSClient;
  wsConnection?: Connection;

  constructor(options: ClientOptions) {
    this.options = Object.assign({}, defaults, options);
    this.logger = createLogger({ level: this.options.logging ? 'info' : 'error' });
    this.ws = new WSClient();
  }

  async run() {
    this.logger.log('Connecting...');
    this.ws.connect(this.options.wsUrl);
    this.wsConnection = (await once(this.ws, 'connect'))[0] as Connection;
    this.logger.log('Connected.');
    this.wsConnection.on('error', e => this.logger.error(e));
    this.wsConnection.on('message', message => this.handleMessage(message.utf8Data));
    // todo: connectFailed
  }

  async close() {
    if (this.wsConnection) {
      this.wsConnection.close();
      await once(this.wsConnection, 'close');
      this.wsConnection = undefined;
    }
  }

  private async handleMessage(message = '') {
    this.logger.log(`REQUEST: ${message}`);
    const resBody = await this.getResBody(message);
    this.logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
    this.wsConnection!.send(JSON.stringify(resBody));
  }

  private async getResBody(message: string) {
    try {
      const reqBody = JSON.parse(message) as ReqBody;
      return await this.callHandler(reqBody);
    } catch (e) {
      this.logger.error(e);
      // todo: handle sber error response
      return buildAliceErrorResponse(e);
    }
  }

  private async callHandler(reqBody: unknown) {
    const { handler } = this.options;
    return typeof handler === 'function'
      ? handler(reqBody)
      : proxyHttp(handler, reqBody);
  }
}

function buildAliceErrorResponse(e: Error) {
  const message = (e.stack || e.message).split('\n').slice(0, 2).join('\n');
  return {
    response: {
      text: message,
      tts: 'Ошибка',
    },
    version: '1.0',
  };
}
