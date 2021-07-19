/**
 * Proxy to http url.
 */
import fetch, { Response } from 'node-fetch';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
const method = 'POST';

export async function proxyHttp(url: string, reqBody: unknown) {
  const body = JSON.stringify(reqBody);
  const response = await fetch(url, { method, headers, body });
  if (!response.ok) {
    const message = await buildErrorMessage(response);
    throw new Error(message);
  }
  return response.json();
}

async function buildErrorMessage(response: Response) {
  return [
    response.status,
    response.statusText,
    await response.text(),
  ].filter(Boolean).join(' ');
}
