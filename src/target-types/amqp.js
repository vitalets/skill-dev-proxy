/**
 * Proxy as message to amqp broker and wait response.
 */

const getAmqp = () => require('amqplib');

const FROM_USER_QUEUE = 'from-user';
const FROM_SKILL_QUEUE = 'from-skill';

let conn;
let channel;

exports.proxy = async ({ url, reqBody }) => {
  const amqp = getAmqp();
  conn = conn || await amqp.connect(url);
  channel = channel || await conn.createChannel();
  await sendMessage(JSON.stringify(reqBody));
  return JSON.parse(await waitMessage());
};

async function sendMessage(message) {
  await channel.assertQueue(FROM_USER_QUEUE);
  await channel.sendToQueue(FROM_USER_QUEUE, Buffer.from(message));
}

async function waitMessage() {
  let resolve;
  const promise = new Promise(r => resolve = r);
  await channel.assertQueue(FROM_SKILL_QUEUE);
  const { consumerTag } = await channel.consume(FROM_SKILL_QUEUE, msg => {
    resolve(msg.content.toString());
  }, {noAck: true});
  promise.then(() => channel.cancel(consumerTag));
  return promise;
}
