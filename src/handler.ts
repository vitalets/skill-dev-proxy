import { ResBody as AliceResBody } from 'alice-types';
import { Response } from 'uni-skill';
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
  ShowTargets, // <- default component
];

export async function handleUserMessage(reqBody: unknown) {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await buildResBody(reqBody);
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
}

async function buildResBody(reqBody: unknown) {
  const ctx = new Ctx(reqBody);
  try {
    await runComponents(ctx);
  } catch (e) {
    const response = errorHandler(e) as AliceResBody['response'];
    convertAliceResponseToUniversal(response, ctx.response);
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
  if (response.isAlice()) {
    response.body.response = aliceResponse;
    return;
  }
  response.addText(aliceResponse.text);
  if (aliceResponse.tts) response.addTts(aliceResponse.tts);
  if (aliceResponse.buttons) {
    const buttons = aliceResponse.buttons.map(button => button.title);
    response.addSuggest(buttons);
  }
}
