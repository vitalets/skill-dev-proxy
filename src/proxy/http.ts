/**
 * Proxy to http url.
 */
import { ReqBody, ResBody } from 'alice-types';
import type { Response } from 'node-fetch';
// import fetch dynamically on demand
const getFetch = async () => (await import('node-fetch')).default;

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
const method = 'POST';

export async function proxy(url: string, reqBody: ReqBody) {
  const fetch = await getFetch();
  const body = JSON.stringify(reqBody);
  const response = await fetch(url, { method, headers, body });
  if (!response.ok) {
    const message = await buildErrorMessage(response);
    throw new Error(message);
  }
  return await response.json() as ResBody;
}

async function buildErrorMessage(response: Response) {
  return [
    response.status,
    response.statusText,
    await response.text(),
  ].filter(Boolean).join(' ');
}
