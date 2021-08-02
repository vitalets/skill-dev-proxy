import { logger } from './logger';
import { Ctx } from './ctx';
import { errorHandler } from './error-handler';
import { Component } from './components/Component';
import { PingPong } from './components/PingPong';
import { SetTarget } from './components/SetTarget';
import { ShowTargets } from './components/ShowTargets';
import { ProxyToTarget } from './components/ProxyToTarget';
import { ClearState } from './components/ClearState';

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
  ClearState,
  ProxyToTarget,
  ShowTargets, // <- default component
];

export async function handleUserMessage(reqBody: unknown) {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await buildResBody(reqBody);
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
}

async function buildResBody(reqBody: unknown) {
  try {
    const ctx = new Ctx(reqBody);
    await runComponents(ctx);
    return ctx.response.body;
  } catch (e) {
    return errorHandler(e);
  }
}

// todo: user bot-components? (botz)
async function runComponents(ctx: Ctx) {
  for (const C of Components) {
    const handled = await runComponent(C, ctx);
    if (handled) {
      return;
    }
  }

  const LastComponent = Components[Components.length - 1];
  await runComponent(LastComponent, ctx, { force: true });
}

async function runComponent(C: typeof Component, ctx: Ctx, { force = false } = {}) {
  const component = new C(ctx);
  if (force || component.match()) {
    const response = await component.reply() as unknown;
    if (response) {
      ctx.response.data = response as typeof ctx.response.data;
    }
    return true;
  }
}
