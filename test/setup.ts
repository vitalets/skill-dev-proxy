// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="../src/externals" />

import 'dotenv/config';
import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import User from 'alice-tester';
import { ReqBody } from 'alice-types';

export const isTestingDist = process.env.TEST_TARGET === 'dist';
export const getSrc = () => import(isTestingDist ? '../dist' : '../src');

type AssertType = typeof chai.assert;
type UserType = typeof User;
type nockType = typeof nock;
type sinonType = typeof sinon;

declare global {
  const assert: AssertType;
  const User: UserType;
  const nock: nockType;
  const sinon: sinonType;
}

chai.config.truncateThreshold = 0;

Object.assign(global, {
  assert: chai.assert,
  User,
  nock,
  sinon,
});

before(async () => {
  const { getHandler } = await getSrc();
  const handler = getHandler([
    {
      name: 'навык 1',
      url: 'https://my-webhook.ru'
    },
    {
      name: 'Локалхост',
      regexp: /(local|локал|около)\s?([hfp]ost|[хп]ост)/i,
      url: 'amqps://my-amqp-url'
    },
  ]);
  User.config.webhookUrl = (reqBody: ReqBody) => handler(reqBody);
  User.config.stopWords = [];
  User.config.responseTimeout = 0;
});

afterEach(() => {
  nock.cleanAll();
  sinon.restore();
});
