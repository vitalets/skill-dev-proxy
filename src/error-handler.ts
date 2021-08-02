import { reply, text, tts, buttons } from 'alice-renderer';
import { logger } from './logger';
import { Ctx } from './ctx';

export function errorHandler(ctx: Ctx, e: Error) {
  logger.error(e);
  const ttsMessage = hasRussianLetters(e.message) ? e.message : 'Ошибка';
  const textMessage = (e.stack || e.message).split('\n').slice(0, 2).join('\n');
  ctx.response.data = reply`
    ${tts(ttsMessage)}
    ${text(textMessage)}
    ${buttons([ 'Список таргетов' ])}
  `;
}

function hasRussianLetters(s: string) {
  return /[а-яёЁ]/i.test(s);
}
