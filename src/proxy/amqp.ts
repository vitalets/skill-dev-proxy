/**
 * Proxy as message to amqp broker and wait response.
 */

import { ReqBody, ResBody } from 'alice-types';
import amqplib, { Connection, Channel } from 'amqplib';

export const FROM_USER_QUEUE = 'from-user';
export const FROM_SKILL_QUEUE = 'from-skill';

let connection: Connection | null;
let channel: Channel;

export async function proxy(url: string, reqBody: ReqBody) {
  const reuseConnection = Boolean(connection);
  connection = connection || await amqplib.connect(url);
  channel = reuseConnection && channel ? channel : await connection.createChannel();
  await sendMessageFromUser(JSON.stringify(reqBody));
  return JSON.parse(await waitMessageFromSkill()) as ResBody;
}

export async function close() {
  await connection?.close();
  connection = null;
}

async function sendMessageFromUser(message: string) {
  const { consumerCount } = await channel.assertQueue(FROM_USER_QUEUE);
  if (consumerCount === 0) {
    throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
  }
  channel.sendToQueue(FROM_USER_QUEUE, Buffer.from(message), { expiration: 1000 });
}

async function waitMessageFromSkill() {
  let resolve: (value: string) => void;
  const promise = new Promise<string>(r => resolve = r);
  await channel.assertQueue(FROM_SKILL_QUEUE);
  const { consumerTag } = await channel.consume(FROM_SKILL_QUEUE, msg => {
    if (msg) {
      resolve(msg.content.toString());
    }
  }, {noAck: true});
  promise.then(() => channel.cancel(consumerTag));
  return promise;
}
