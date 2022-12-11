// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="../src/externals" />

import targets from './targets.json';
import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import getPort from 'get-port';
import User from 'alice-tester';
import { server } from '../src/server/server';
import { targetManager } from '../src/target-manager';
import { memoryState } from '../src/state/memory';

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
  const port = await getPort();
  await server.start(port);
  User.config.webhookUrl = `http://localhost:${port}`;
  User.config.stopWords = [];
  User.config.responseTimeout = 0;
});

beforeEach(() => {
  targetManager.init(JSON.stringify(targets));
});

afterEach(async () => {
  nock.cleanAll();
  sinon.restore();
  await memoryState.save({});
});

after(async () => {
  await server.stop();
});
