import { reply, text, tts, buttons } from 'alice-renderer';
import { logger } from './logger';

export function errorHandler(e: Error) {
  logger.error(e);
  const ttsMessage = hasRussianLetters(e.message) ? e.message : 'Ошибка';
  const textMessage = (e.stack || e.message).split('\n').slice(0, 2).join('\n');
  return reply`
    ${tts(ttsMessage)}
    ${text(textMessage)}
    ${buttons([ 'Повторить', 'Список таргетов' ])}
  `;
}

function hasRussianLetters(s: string) {
  return /[а-яёЁ]/i.test(s);
}
