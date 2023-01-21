import Timeout from 'await-timeout';
import { RequestInit } from 'node-fetch';
import { isLocalhostTarget, Target } from '../target-manager';
import { logger } from '../logger';
import { proxyHttp } from './http';
import { proxyAmqp } from './amqp';
import { config } from '../config';
import { proxyWsCloudFn } from './cloud-fn';

export interface ProxyRequestOptions {
  timeout?: number;
  iamToken: string;
  reqId: string;
}

export async function proxyRequest(
  target: Target,
  { method, headers, body }: RequestInit,
  options: ProxyRequestOptions) {
  logger.log(`PROXY TO TARGET: ${target.name}`);
  const fn = () => isLocalhostTarget(target)
    ? proxyLocalhost(body, options)
    : proxyHttp(target.url, { method, headers, body });
  const resBody = await Timeout.wrap(fn(), options.timeout || 3000, `Таймаут таргета ${target.name}`);
  if (!resBody) throw new Error(`Пустой ответ.`);
  if (resBody.error) throw new Error(resBody.error);
  return resBody;
}

function proxyLocalhost(body: RequestInit[ 'body' ], options: ProxyRequestOptions) {
  if (config.amqpUrl) return proxyAmqp({ body });
  if (config.stubWsUrl) return proxyWsCloudFn({ body }, options);
  // not used now because this needs running server
  // proxyWs({ body });
  throw new Error(`No WebSocket config url`);
}
