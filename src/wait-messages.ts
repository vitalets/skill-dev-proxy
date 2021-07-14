/**
 * Client library for debugging skills on localhost.
 * Uses amqp messaging via cloudamqp.com.
 */
import amqp, { Channel } from 'amqplib';
import { FROM_USER_QUEUE, FROM_SKILL_QUEUE } from './proxy/amqp';
import { proxy as httpProxy } from './proxy/http';

export interface WaitOptions {
  amqpUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: string | ((...args: any[]) => any);
}

export async function waitMessages({ amqpUrl, handler }: WaitOptions) {
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();
  await listenMessages(channel, handler);
  return connection;
}

async function sendMessage(channel: Channel, message: string) {
  await channel.assertQueue(FROM_SKILL_QUEUE);
  channel.sendToQueue(FROM_SKILL_QUEUE, Buffer.from(message), { expiration: 1000 });
}

async function listenMessages(channel: Channel, handler: WaitOptions['handler']) {
  await channel.assertQueue(FROM_USER_QUEUE);
  await channel.consume(FROM_USER_QUEUE, async msg => {
    if (!msg) throw new Error('Got empty message');
    const content = msg.content.toString();
    const reqBody = JSON.parse(content);
    const resBody = await callHandler(handler, reqBody);
    await sendMessage(channel, JSON.stringify(resBody));
  }, { noAck: true });
  console.log('waiting...'); // eslint-disable-line no-console
}

async function callHandler(handler: WaitOptions['handler'], reqBody: unknown) {
  try {
    return typeof handler === 'function'
      ? await handler(reqBody, { requestId: 'xxx' })
      : await httpProxy(handler, reqBody);
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    // todo: handle sber error response
    return buildAliceErrorResponse(e);
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
