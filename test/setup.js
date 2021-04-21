const chai = require('chai');
const User = require('alice-tester');
const { handler } = require(process.env.HANDLER_PATH || '../src');

chai.config.truncateThreshold = 0;
User.config.webhookUrl = reqBody => handler(reqBody, {});

Object.assign(global, {
  assert: chai.assert,
  User,
});
