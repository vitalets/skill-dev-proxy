/**
 * Client library for debugging skills on localhost.
 * Uses amqp messaging via cloudamqp.com.
 */
import amqp, { Connection, Channel } from 'amqplib';
import { FROM_USER_QUEUE, FROM_SKILL_QUEUE } from './proxy/amqp';
import { proxy as httpProxy } from './proxy/http';

const CLOUD_REQUEST_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

export async function waitMessages(options: WaitOptions) {
  return new Wait(options).run();
}

export interface WaitOptions {
  amqpUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: string | ((...args: any[]) => any);
  logging?: boolean;
}

class defaults implements Partial<WaitOptions> {
  logging = true
}

class Wait {
  options: Required<WaitOptions>;
  connection!: Connection;
  channel!: Channel;

  constructor(options: WaitOptions) {
    this.options = Object.assign(new defaults(), options);
  }

  async run() {
    this.connection = await amqp.connect(this.options.amqpUrl);
    this.channel = await this.connection.createChannel();
    await this.listenMessagesFromUser();
    return this.connection;
  }

  async listenMessagesFromUser() {
    await this.channel.assertQueue(FROM_USER_QUEUE);
    await this.channel.consume(FROM_USER_QUEUE, async msg => {
      if (!msg) throw new Error('Got empty message');
      const reqBodyStr = msg.content.toString();
      this.log(`REQUEST: ${reqBodyStr}`);
      const reqBody = JSON.parse(reqBodyStr);
      const resBody = await this.callHandler(reqBody);
      const resBodyStr = JSON.stringify(resBody);
      this.log(`RESPONSE: ${resBodyStr}`);
      await this.sendMessageFromSkill(resBodyStr);
    }, { noAck: true });
    this.info('Waiting...');
  }

  async sendMessageFromSkill(message: string) {
    await this.channel.assertQueue(FROM_SKILL_QUEUE);
    this.channel.sendToQueue(FROM_SKILL_QUEUE, Buffer.from(message), { expiration: 1000 });
  }

  async callHandler(reqBody: unknown) {
    const { handler } = this.options;
    try {
      return typeof handler === 'function'
        ? await handler(reqBody, { requestId: CLOUD_REQUEST_ID })
        : await httpProxy(handler, reqBody);
    } catch (e) {
      this.info(e);
      // todo: handle sber error response
      return buildAliceErrorResponse(e);
    }
  }

  log(...args: unknown[]) {
    if (this.options.logging) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }

  info(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
}

function buildAliceErrorResponse(e: Error) {
  const message = e.stack!.split('\n').slice(0, 2).join('\n');
  return {
    response: {
      text: message,
      tts: 'Ошибка',
    },
    version: '1.0',
  };
}
