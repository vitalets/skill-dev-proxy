// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="../src/externals" />

import chai from 'chai';
import nock from 'nock';
import User from 'alice-tester';
import { ReqBody } from 'alice-types';

type AssertType = typeof chai.assert;
type UserType = typeof User;
type nockType = typeof nock;

declare global {
  const assert: AssertType;
  const User: UserType;
  const nock: nockType;
}

chai.config.truncateThreshold = 0;

Object.assign(global as any, {
  assert: chai.assert,
  User,
  nock,
});

before(async () => {
  const { default: createHandler } = await import(process.env.HANDLER_PATH || '../src');
  const handler = createHandler([
    { name: 'навык 1', url: 'https://my-webhook.ru' },
    { name: 'Локалхост', regexp: /local\s?[hfp]ost/i, url: 'amqps://my-amqp-url' },
  ]);
  User.config.webhookUrl = (reqBody: ReqBody) => handler(reqBody);
  User.config.stopWords = [];
  User.config.responseTimeout = 0;
});

afterEach(() => {
  nock.cleanAll();
});
