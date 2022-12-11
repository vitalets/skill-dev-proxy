import { reply, text, tts, buttons } from 'alice-renderer';
import { logger } from './logger';

export function errorHandler(e: Error, targetName?: string) {
  logger.error(e);
  const ttsMessage = hasRussianLetters(e.message) ? e.message : 'Ошибка';
  const textMessage = `(target: ${targetName || 'none'}) ${getErrorMsg(e)}`;
  return reply`
    ${tts(ttsMessage)}
    ${text(textMessage)}
    ${buttons([ 'Повторить', 'Список таргетов' ])}
  `;
}

function getErrorMsg(e: Error) {
  return (e.stack || e.message).split('\n').slice(0, 2).join('\n');
}

function hasRussianLetters(s: string) {
  return /[а-яёЁ]/i.test(s);
}
