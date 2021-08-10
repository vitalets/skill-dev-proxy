import { reply, text, tts, buttons } from 'alice-renderer';
import { targetManager } from './target-manager';
import { logger } from './logger';

export function errorHandler(e: Error) {
  logger.error(e);
  const ttsMessage = hasRussianLetters(e.message) ? e.message : 'Ошибка';
  const textMessage = `${getTargetMsg()} ${getErrorMsg(e)}`;
  return reply`
    ${tts(ttsMessage)}
    ${text(textMessage)}
    ${buttons([ 'Повторить', 'Список таргетов' ])}
  `;
}

function getErrorMsg(e: Error) {
  return (e.stack || e.message).split('\n').slice(0, 2).join('\n');
}

function getTargetMsg() {
  const targetName = targetManager.selectedTarget?.name || 'none';
  return `(target: ${targetName})`;
}

function hasRussianLetters(s: string) {
  return /[а-яёЁ]/i.test(s);
}
