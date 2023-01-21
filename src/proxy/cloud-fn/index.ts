/**
 * Proxy to ws from cloud function.
 */

import { ProxyRequestOptions } from '..';
import { RequestInit } from 'node-fetch';
import { WsClient } from './ws-client';
import { logger } from '../../logger';
import { YdbClient } from './ydb';
import { ApigwError, sendToConnection } from './ws-apigw';
import { WsRequest } from './types';
import { config } from '../../config';

// reuse ws client between calls
let wsClient: WsClient;

export async function proxyWsCloudFn(
  { body }: RequestInit,
  options: ProxyRequestOptions
) {
  if (typeof body !== 'string') {
    throw new Error(`Can't proxy this body to ws: ${typeof body}`);
  }
  const wsClient = getWsClient();
  try {
    const clientConnectionId = await getClientConnectionId(options.iamToken);
    await wsClient.ensureConnected();
    await sendToLocalClient(clientConnectionId, body, options);
    const response = await waitResponse(wsClient, options.reqId);
    return JSON.parse(response.payload);
  } finally {
    wsClient.clearListeners();
  }
}

async function getClientConnectionId(iamToken: string) {
  const connection = await new YdbClient(iamToken).getConnection(config.stubId);
  if (!connection) throw new Error(`No client connections`);
  const { connectionId } =  connection;
  logger.debug(`Client connection found: ${connectionId}`);
  return connectionId;
}

async function sendToLocalClient(
  clientConnectionId: string,
  body: string,
  { iamToken, reqId }: ProxyRequestOptions
) {
  logger.info(`Sending request to local client...`);
  const message: WsRequest = {
    type: 'request',
    reqId,
    replyConnectionId: wsClient.connectionId,
    token: iamToken,
    payload: body,
  };
  try {
    await sendToConnection(clientConnectionId, message, iamToken);
  } catch (e) {
    if (e instanceof ApigwError && e.code === 5) {
      throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
    } else {
      throw e;
    }
  }
  return message;
}

async function waitResponse(wsClient: WsClient, reqId: string) {
  logger.log(`Waiting response...`);
  const message = await wsClient.waitMessage(m => m.reqId === reqId);
  logger.log(`Got response: ${JSON.stringify(message)}`);
  if (message.type === 'response') return message;
  throw new Error(`Invalid response type: ${message.type}`);
}

function getWsClient() {
  wsClient = wsClient || new WsClient(config.stubWsUrl);
  // todo: check disconnected
  return wsClient;
}
