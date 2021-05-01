/**
 * Script for debugging amqp.
 *
 * 1. run sample script listening events on localhost:
 * node examples/localhost/check-on-device
 * 2. run this script to send message to localhost (in another terminal window):
 * npm run debug:amqp
 */

// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="../src/externals" />

import 'dotenv/config';
import createHandler from '../src';
import User from 'alice-tester';

User.config.stopWords = [];

main();

async function main() {
  const handler = createHandler([
    { name: 'Локалхост', url: process.env.AMQP_URL! },
  ]);
  const user = new User(handler);
  await user.say('установи таргет локалхост');
  await user.say('привет');
}
