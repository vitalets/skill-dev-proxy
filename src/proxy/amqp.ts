/**
 * Proxy as message to amqp broker and wait response.
 */

import { ReqBody, ResBody } from 'alice-types';
import type { Connection, Channel } from 'amqplib';
// import amqplib dynamically on demand
const getAmqplib = async () => (await import('amqplib')).default;

const FROM_USER_QUEUE = 'from-user';
const FROM_SKILL_QUEUE = 'from-skill';

let conn: Connection;
let channel: Channel;

export async function proxy(url: string, reqBody: ReqBody) {
  if (!conn) {
    const amqplib = await getAmqplib();
    conn = await amqplib.connect(url);
  }
  channel = channel || await conn.createChannel();
  await sendMessage(JSON.stringify(reqBody));
  return JSON.parse(await waitMessage()) as ResBody;
};

async function sendMessage(message: string) {
  const { consumerCount } = await channel.assertQueue(FROM_USER_QUEUE);
  if (consumerCount === 0) {
    throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
  }
  channel.sendToQueue(FROM_USER_QUEUE, Buffer.from(message), { expiration: 1000 });
}

async function waitMessage() {
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
