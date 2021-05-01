/**
 * Debug local skill on real device (uses amqp messaging via cloudamqp.com)
 * Usage:
 * node examples/localhost/check-on-device
 */
require('dotenv').config();
const amqp = require('amqplib');
const { handler } = require('./skill');

const AMQP_URL = process.env.AMQP_URL;

const FROM_USER_QUEUE = 'from-user';
const FROM_SKILL_QUEUE = 'from-skill';

main();

async function main() {
  const channel = await createChannel();
  await listenMessages(channel);
}

async function createChannel() {
  const conn = await amqp.connect(AMQP_URL);
  const channel = await conn.createChannel();
  return channel;
}

async function sendMessage(channel, message) {
  await channel.assertQueue(FROM_SKILL_QUEUE);
  await channel.sendToQueue(FROM_SKILL_QUEUE, Buffer.from(message), { expiration: 1000 });
}

async function listenMessages(channel) {
  await channel.assertQueue(FROM_USER_QUEUE);
  await channel.consume(FROM_USER_QUEUE, async msg => {
    const content = msg.content.toString();
    const reqBody = JSON.parse(content);
    const resBody = await callHandler(reqBody);
    await sendMessage(channel, JSON.stringify(resBody));
  }, {noAck: true});
  console.log('Waiting messages from user...');
}

async function callHandler(reqBody) {
  try {
    return await handler(reqBody);
  } catch (e) {
    console.error(e);
    return buildErrorResponse(e);
  }
}

function buildErrorResponse(e) {
  const message = e.stack.split('\n').slice(0, 2).join('\n');
  return {
    response: {
      text: message,
      tts: 'Ошибка',
    },
    version: '1.0',
  };
}
