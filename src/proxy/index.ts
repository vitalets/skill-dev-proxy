import Timeout from 'await-timeout';
import { RequestInit } from 'node-fetch';
import { isLocalhostTarget, targetManager } from '../target-manager';
import { logger } from '../logger';
import { proxyWs } from './ws';
import { proxyHttp } from './http';

export interface ProxyRequestOptions {
  timeout?: number;
}

export async function proxyRequest({ method, headers, body }: RequestInit, options: ProxyRequestOptions = {}) {
  const { selectedTarget } = targetManager;
  if (!selectedTarget) throw new Error('Не выбран таргет.');
  logger.log(`PROXY TO TARGET: ${selectedTarget.name}`);
  const fn = () => isLocalhostTarget(selectedTarget)
    ? proxyWs({ body })
    : proxyHttp(selectedTarget.url, { method, headers, body });
  const resBody = await Timeout.wrap(fn(), options.timeout || 3000, `Таймаут таргета ${selectedTarget.name}`);
  if (!resBody) throw new Error(`Пустой ответ.`);
  if (resBody.error) throw new Error(resBody.error);
  return resBody;
}
