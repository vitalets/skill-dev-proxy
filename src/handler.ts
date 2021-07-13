import { ReqBody } from 'alice-types';
import { logger } from './logger';
import { Ctx } from './ctx';
import { errorHandler } from './error-handler';
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

export async function handler(reqBody: ReqBody) {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await buildResBody(reqBody);
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
}

async function buildResBody(reqBody: ReqBody) {
  try {
    const ctx = new Ctx(reqBody);
    await runComponents(ctx);
    return ctx.resBody;
  } catch (e) {
    return errorHandler(e);
  }
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
  if (force || component.match()) {
    await component.reply();
    ctx.buildResBody();
  }
}
