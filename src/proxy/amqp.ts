/**
 * Proxy via amqp server.
 * API ref: https://amqp-node.github.io/amqplib/channel_api.html#flowcontrol
 *
 * Often getting delay more than 3 sec :(
 */

import amqplib from 'amqplib';
import { RequestInit } from 'node-fetch';
import { logger } from '../logger';

const { AMQP_URL = '' } = process.env;

let conn: amqplib.Connection;
export const reqQueue = 'request';
export const resQueue = 'response';

export async function assertConnection(amqpUrl?: string) {
    conn = conn || await amqplib.connect(amqpUrl || AMQP_URL);
    return conn;
}

export async function closeConnection() {
    await conn?.close();
}

// todo: преобразовывать весь запрос в json { method, headers, body }
export async function proxyAmqp({ body }: RequestInit) {
    if (typeof body !== 'string') throw new Error(`Can't proxy this body to ws`);
    const conn = await assertConnection();
    const channel = await conn.createChannel();
    await assertClientConnected(channel);
    await channel.assertQueue(resQueue);
    channel.sendToQueue(reqQueue, Buffer.from(body));
    try {
        return await waitJsonFromClient(channel, resQueue);
    } finally {
        channel?.close().catch(e => logger.log(e));
    }

    // todo: timeout
    // try {
    //   return await waitJsonFromClient();
    // } catch (e) {
    //   if (e.name !== 'AbortError') throw e;
    // }
}

async function assertClientConnected(channel: amqplib.Channel) {
    const consumerCount = await getConsumerCount(channel);
    if (!consumerCount) {
        throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
    }
}

async function waitJsonFromClient(channel: amqplib.Channel, queue: string) {
    const { promise, resolve, reject } = createPromise();
    const { consumerTag } = await channel.consume(queue, (msg) => {
        if (msg !== null) {
            // todo: check reqId
            logger.log('Received:', msg.content.toString());
            const data = JSON.parse(msg.content.toString());
            channel.cancel(consumerTag);
            resolve(data);
        } else {
            reject(new Error('Consumer cancelled by server'));
        }
    }, { noAck: true });
    return promise;
}

async function getConsumerCount(channel: amqplib.Channel) {
    try {
        const res = await channel.checkQueue(reqQueue);
        return res.consumerCount;
    } catch (e) {
        if (e.message.includes('NOT-FOUND')) return 0;
        throw e;
    }
}

function createPromise<T = unknown>() {
  const noop = () => { /** noop */ };
  let resolve: (data: T) => void = noop;
  let reject: (reason: Error) => void = noop;
  const promise = new Promise<T>((res, rej) => [ resolve, reject ] = [ res, rej ]);
  return { promise, resolve, reject };
}
