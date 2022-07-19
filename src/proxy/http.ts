/**
 * Proxy to http url.
 */
import fetch, { Response, RequestInit } from 'node-fetch';

export async function proxyHttp(url: string, { method, headers, body }: RequestInit) {
  const response = await fetch(url, { method, headers, body });
  if (!response.ok) {
    const message = await buildErrorMessage(response);
    throw new Error(message);
  }
  // todo: always json?
  return response.json();
}

async function buildErrorMessage(response: Response) {
  return [
    response.status,
    response.statusText,
    await response.text(),
  ].filter(Boolean).join(' ');
}
