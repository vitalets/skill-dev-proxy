import { ReqBody } from 'alice-types';
import { proxy as httpProxy } from './http';
import { proxy as amqpProxy } from './amqp';

const PROXY_TYPES = {
  http: httpProxy,
  amqp: amqpProxy,
};

export function proxy(url: string, reqBody: ReqBody) {
  const protocol = extractProtocol(url) as keyof typeof PROXY_TYPES;
  const proxyFn = PROXY_TYPES[protocol];
  return proxyFn(url, reqBody);
}

function extractProtocol(url: string) {
  return new URL(url).protocol.replace(/s?:$/, '');
}
