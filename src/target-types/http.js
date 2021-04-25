/**
 * Proxy to http url.
 */
const getFetch = () => require('node-fetch');

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
const method = 'POST';

exports.proxy = async ({ url, reqBody }) => {
  const fetch = getFetch();
  const body = JSON.stringify(reqBody);
  const response = await fetch(url, { method, headers, body });
  return response.ok
    ? response.json()
    : await throwResponseError(response);
};

async function throwResponseError(response) {
  const message = [response.status, response.statusText, await response.text()].filter(Boolean).join(' ');
  throw new Error(message);
}
