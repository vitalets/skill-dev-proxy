/**
 * Script for debugging amqp.
 * Sends user message to localhost and waits for response
 */
require('dotenv').config();
const { handler } = require('../src');
const targets = require('../src/targets');
const User = require('alice-tester');

User.config.webhookUrl = reqBody => handler(reqBody);
User.config.stopWords = [];
// replace url for localhost
targets[0].url = process.env.AMQP_URL;

main();

async function main() {
  const user = new User();
  await user.say('установи таргет локалхост');
  await user.say('привет');
}
