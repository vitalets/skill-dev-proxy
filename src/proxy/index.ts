import { ReqBody } from 'alice-types';

const PROXY_TYPES = {
  http: () => import('./http'),
  amqp: () => import('./amqp'),
};

export async function proxy(url: string, reqBody: ReqBody) {
  const protocol = extractProtocol(url) as keyof typeof PROXY_TYPES;
  const { proxy: proxyFn } = await PROXY_TYPES[protocol]();
  return proxyFn(url, reqBody);
}

function extractProtocol(url: string) {
  return new URL(url).protocol.replace(/s?:$/, '');
}
