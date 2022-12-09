/**
 * WebSocket in serverless container.
 * NOT USED NOW: even with concurrency 16 several container instances created.
 */
import fetch, { RequestInit } from 'node-fetch';
import { logger } from '../logger';

// todo: better code these globals
let connId = '';
let resolve: undefined | ((data: unknown) => void);
let reject: undefined | ((data: unknown) => void);

export async function proxyWsContainer({ body }: RequestInit) {
  if (typeof body !== 'string') throw new Error(`Can't proxy this body to ws`);
  assertClientConnected();
  const iamToken = await getIamToken();
  await sendMessageToClient(body, iamToken);
  return waitJsonFromClient();
}

export function handleConnect(connectionId: string) {
  logger.log(`ws connect: ${connectionId}`);
  connId = connectionId;
}

export function handleMessage(data: string) {
  logger.log(`ws got message from client: ${data}`);
  // todo: handle ping
  resolve?.(data && JSON.parse(data));
}

export function handleDisconnect(connectionId: string) {
  logger.log(`ws disconnect: ${connectionId}`);
  if (connId === connectionId) {
    connId = '';
    reject?.(new Error(`Дисконнект`));
  }
}

function assertClientConnected() {
  logger.log(`connId: ${connId}`);
  if (!connId) {
    throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
  }
}

/**
 * See: https://cloud.yandex.ru/docs/serverless-containers/operations/sa
 */
async function getIamToken() {
  const url = 'http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token';
  const headers = { 'Metadata-Flavor': 'Google' };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.access_token;
}

async function sendMessageToClient(data: string, iamToken: string) {
  // see: https://cloud.yandex.ru/docs/api-gateway/apigateway/websocket/api-ref/Connection/send
  const url = 'https://apigateway-connections.api.cloud.yandex.net/apigateways/websocket/v1/connections/{connectionId}:send'
    .replace('{connectionId}', connId);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${iamToken}`,
  };
  const body = { data };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ${await res.text()}`);
  logger.log(`ws message to client sent: ${url}`);
}

async function waitJsonFromClient() {
  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
}

export function getReuseInfo() {
  const self = getReuseInfo as unknown as { startTime: number };
  if (!self.startTime) {
    self.startTime = Date.now();
    return `fresh`;
  } else {
    const seconds = Math.floor((Date.now() - self.startTime) / 1000);
    return `reused ${seconds}s`;
  }
}
