/**
 * AMQP client for debugging skills on localhost.
 * See: https://api.cloudamqp.com
 */
import { assertConnection, closeConnection, reqQueue, resQueue } from '../proxy/amqp';
import { proxyHttp } from '../proxy/http';
import { Defaults } from '../utils';
import { createLogger, Logger, LogLevelNames } from '../logger';
import { Channel } from 'amqplib';

// todo: create Common Client class

export interface AmqpClientOptions {
  amqpUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: string | ((...args: any[]) => any);
  logLevel?: LogLevelNames;
}

const defaults: Defaults<AmqpClientOptions> = {
  logLevel: 'debug',
};

export class AmqpClient {
  options: Required<AmqpClientOptions>;
  logger: Logger;
  channel!: Channel;

  constructor(options: AmqpClientOptions) {
    this.options = Object.assign({}, defaults, options);
    this.assertOptions();
    this.logger = createLogger({ level: this.options.logLevel });
  }

  async run() {
    const conn = await assertConnection(this.options.amqpUrl);
    this.channel = await conn.createChannel();
    await this.channel.assertQueue(reqQueue, { durable: true });
    this.logger.log(`Waiting messages in queue: ${reqQueue}`);
    await this.channel.consume(reqQueue, async msg => {
      if (msg !== null) {
        await this.handleMessage(msg.content.toString());
      } else {
        this.logger.log('Consumer cancelled by server');
      }
    }, { noAck: true });
  }

  async close() {
    await this.channel?.close();
    await closeConnection();
  }

  private async handleMessage(message = '') {
    this.logger.debug(`\nREQUEST: ${message}`);
    const resBody = await this.getResBody(message);
    this.logger.debug(`RESPONSE: ${JSON.stringify(resBody)}`);
    const resBodyBuffer = Buffer.from(JSON.stringify(resBody));
    this.channel.sendToQueue(resQueue, resBodyBuffer);
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
    if (!this.options.amqpUrl) throw new Error(`Empty amqpUrl`);
    if (!this.options.handler) throw new Error(`Empty handler`);
  }
}

function buildErrorResponse(e: Error) {
  const error = (e.stack || e.message).split('\n').slice(0, 2).join('\n');
  return { error };
}
