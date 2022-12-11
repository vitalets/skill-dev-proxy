/**
 * Voice request handler.
 */

// Make ts-node happy
// See: https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference types="./externals" />

import { Response, AliceResponse } from 'uni-skill';
import { logger } from './logger';
import { Ctx } from './ctx';
import { errorHandler } from './error-handler';
import { Component } from './components/Component';
import { PingPong } from './components/PingPong';
import { SetTarget } from './components/SetTarget';
import { ShowTargets } from './components/ShowTargets';
import { ProxyToTarget } from './components/ProxyToTarget';

type AliceResBody = AliceResponse['body'];

export interface ReqInfo {
  reqId: string;
  functionId: string;
  iamToken: string;
}

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
  ProxyToTarget,
  ShowTargets, // <- default component
];

export async function handleUserMessage(reqBody: unknown, reqInfo: ReqInfo): Promise<Response['body']> {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await buildResBody(reqBody, reqInfo);
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
}

async function buildResBody(reqBody: unknown, reqInfo: ReqInfo) {
  const ctx = new Ctx(reqBody, reqInfo);
  logger.log(`PLATFORM: ${getPlatform(ctx)}`);
  try {
    await ctx.stateManager.load();
    await runComponents(ctx);
  } catch (e) {
    const response = errorHandler(e, ctx.state.selectedTarget) as AliceResBody['response'];
    convertAliceResponseToUniversal(response, ctx.response);
  } finally {
    await ctx.stateManager.save();
  }
  return ctx.response.body;
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
    const response = await component.reply() as unknown as AliceResBody['response'];
    if (response) {
      convertAliceResponseToUniversal(response, ctx.response);
    }
    return true;
  }
}

/**
 * Так как alice-renderer в компонентах выдает ответ только под Алису,
 * то здесь конвертим его в универсальный ответ под любую платформу.
 */
function convertAliceResponseToUniversal(aliceResponse: AliceResBody['response'], response: Response) {
  response.addText(aliceResponse.text);
  response.addVoice(aliceResponse.tts || '');
  response.addSuggest((aliceResponse.buttons || []).map(button => button.title));
}

function getPlatform(ctx: Ctx) {
  switch (true) {
    case ctx.request.isAlice(): return 'alice';
    case ctx.request.isSber(): return 'sber';
    case ctx.request.isMarusya(): return 'marusya';
    default: return 'uknown';
  }
}
