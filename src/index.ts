import { ReqBody } from 'alice-types';
import { logger } from './logger';
import { Ctx } from './ctx';
import { Target, targetManager } from './targets';
import { Component } from './components/Component';
import { PingPong } from './components/PingPong';
import { SetTarget } from './components/SetTarget';
import { ShowTargets } from './components/ShowTargets';
import { ProxyToTarget } from './components/ProxyToTarget';

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
  ProxyToTarget,
  ShowTargets,
];

export = createHandler;

function createHandler(targets: Target[]) {
  targetManager.targets = targets;
  return async (reqBody: ReqBody) => {
    logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
    const ctx = new Ctx(reqBody);
    await runComponents(ctx);
    logger.log(`RESPONSE: ${JSON.stringify(ctx.resBody)}`);
    return ctx.resBody;
  };
}

async function runComponents(ctx: Ctx) {
  for (const C of Components) {
    await runComponent(C, ctx);
    if (ctx.resBody) {
      return;
    }
  }

  const LastComponent = Components[Components.length - 1];
  await runComponent(LastComponent, ctx, { force: true });
}

async function runComponent(C: typeof Component, ctx: Ctx, { force = false } = {}) {
  const component = new C(ctx);
  if (component.match() || force) {
    await component.reply();
    ctx.buildResBody();
  }
}
