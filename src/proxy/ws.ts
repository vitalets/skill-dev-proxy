/**
 * Proxy to websocket.
 */
import { once } from 'events';
import { IMessage } from 'websocket';
import { server } from '../http/server';

let ac: AbortController;

export async function proxyWs(reqBody: unknown) {
  ac?.abort();
  if (!server.wsConnection) {
    throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
  }
  ac = new AbortController();
  server.wsConnection.sendUTF(JSON.stringify(reqBody));
  try {
  const [ response ] = await once(server.wsConnection, 'message', { signal: ac.signal }) as unknown as IMessage[];
  if (response?.utf8Data) return JSON.parse(response.utf8Data);
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
  throw new Error('Пустой ответ.');
}

