/**
 * Test local skill on real device (uses amqp messaging via cloudamqp.com)
 * Usage:
 * 1. start: node examples/check
 * 2. send messages via skill-dev-proxy
 */
const { waitMessages } = require('..');
const { handler } = require('./skill');

waitMessages({
  amqpUrl: process.env.AMQP_URL,
  handler,
});
