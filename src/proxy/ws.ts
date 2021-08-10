/**
 * Proxy to websocket.
 */
import { once } from 'events';
import { IUtf8Message } from 'websocket';
import { server } from '../http/server';
import AbortController from 'abort-controller';

let ac: AbortController;

export async function proxyWs(reqBody: unknown) {
  assertClientConnected();
  recreateAbortController();
  sendJsonToClient(reqBody);
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

function sendJsonToClient(data: unknown) {
  server.wsConnection!.sendUTF(JSON.stringify(data));
}

async function waitJsonFromClient() {
  const [ response ] = await once(server.wsConnection!, 'message', { signal: ac.signal }) as unknown as IUtf8Message[];
  if (response?.utf8Data) {
    return JSON.parse(response.utf8Data);
  }
}
