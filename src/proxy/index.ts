import Timeout from 'await-timeout';
import { RequestInit } from 'node-fetch';
import { isLocalhostTarget, Target } from '../target-manager';
import { logger } from '../logger';
// import { proxyWs } from './ws';
import { proxyHttp } from './http';
import { proxyAmqp } from './amqp';

export interface ProxyRequestOptions {
  timeout?: number;
}

export async function proxyRequest(
  target: Target,
  { method, headers, body }: RequestInit,
  options: ProxyRequestOptions = {}) {
  logger.log(`PROXY TO TARGET: ${target.name}`);
  const fn = () => isLocalhostTarget(target)
    //? proxyWs({ body })
    ? proxyAmqp({ body })
    : proxyHttp(target.url, { method, headers, body });
  const resBody = await Timeout.wrap(fn(), options.timeout || 3000, `Таймаут таргета ${target.name}`);
  if (!resBody) throw new Error(`Пустой ответ.`);
  if (resBody.error) throw new Error(resBody.error);
  return resBody;
}
