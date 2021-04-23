const chai = require('chai');
const User = require('alice-tester');
const nock = require('nock');
const { handler } = require(process.env.HANDLER_PATH || '../src');

chai.config.truncateThreshold = 0;

User.config.webhookUrl = reqBody => handler(reqBody);
User.config.stopWords = [];
User.config.responseTimeout = 0;

Object.assign(global, {
  assert: chai.assert,
  User,
  nock,
});

afterEach(() => {
  nock.cleanAll();
});
