// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="../src/externals" />

import targets from './targets.json';
import { config } from '../src/config';

config.targets = JSON.stringify(targets);
import('../src/run/server');
