// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="../src/externals" />

import targets from './targets.json';
import { config } from '../src/config';
import { runClient } from '../src/client';

config.targets = JSON.stringify(targets);

import('../src/server/run');

runClient({
  wsUrl: 'http://localhost:3000',
  handler: () => {
    // empty
  },
});
