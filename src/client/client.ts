/**
 * Client library for debugging skills on localhost.
 * Uses websocket.
 */
import { once } from 'events';
import { client as WSClient, connection as Connection } from 'websocket';
import { proxyHttp } from '../proxy/http';
import { Defaults } from '../utils';
import { createLogger, Logger, LogLevelNames } from '../logger';

export interface ClientOptions {
  wsUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: string | ((...args: any[]) => any);
  logLevel?: LogLevelNames;
}

const defaults: Defaults<ClientOptions> = {
  logLevel: 'debug',
};

export class Client {
  options: Required<ClientOptions>;
  logger: Logger;
  ws: WSClient;
  wsConnection?: Connection;

  constructor(options: ClientOptions) {
    this.options = Object.assign({}, defaults, options);
    this.assertOptions();
    this.logger = createLogger({ level: this.options.logLevel });
    this.ws = new WSClient();
  }

  async run() {
    this.wsConnection = await this.connect();
    this.wsConnection.on('error', e => this.logger.error(e));
    this.wsConnection.on('message', message => message.type === 'utf8' && this.handleMessage(message.utf8Data));
    this.wsConnection.on('close', () => this.logger.log('Disconnected.'));
  }

  async close() {
    if (this.wsConnection) {
      this.wsConnection.close();
      await once(this.wsConnection, 'close');
      this.wsConnection = undefined;
    }
  }

  private async connect() {
    this.logger.log('Connecting...');
    const ac = new AbortController();
    this.ws.connect(this.options.wsUrl);
    this.ws.on('connectFailed', e => {
      this.logger.error(e);
      ac.abort();
    });
    const connections = await once(this.ws, 'connect', { signal: ac.signal });
    this.logger.log('Connected.');
    return connections[0] as Connection;
  }

  private async handleMessage(message = '') {
    this.logger.debug(`\nREQUEST: ${message}`);
    const resBody = await this.getResBody(message);
    this.logger.debug(`RESPONSE: ${JSON.stringify(resBody)}`);
    this.wsConnection!.send(JSON.stringify(resBody));
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
