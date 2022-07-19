/**
 * Proxy to websocket.
 */
import { once } from 'events';
import { IUtf8Message } from 'websocket';
import { server } from '../server/server';
import { RequestInit } from 'node-fetch';
// import AbortController from 'abort-controller';

let ac: AbortController;

// todo: преобразовывать весь запрос в json { method, headers, body }
export async function proxyWs({ body }: RequestInit) {
  if (typeof body !== 'string') throw new Error(`Can't proxy this body to ws`);
  assertClientConnected();
  recreateAbortController();
  sendMessageToClient(body);
  try {
    return await waitJsonFromClient();
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
}

function recreateAbortController() {
  ac?.abort();
  ac = new AbortController();
}

function assertClientConnected() {
  if (!server.wsConnection) {
    throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
  }
}

function sendMessageToClient(data: string) {
  server.wsConnection!.sendUTF(data);
}

async function waitJsonFromClient() {
  const [ response ] = await once(server.wsConnection!, 'message', { signal: ac.signal }) as unknown as IUtf8Message[];
  if (response?.utf8Data) {
    return JSON.parse(response.utf8Data);
  }
}
