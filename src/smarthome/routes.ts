/**
 * See: https://yandex.ru/dev/dialogs/smart-home/doc/reference/resources.html
 */
import express, { Request, RequestHandler } from 'express';
import { IncomingHttpHeaders } from 'http';
import { logger } from '../logger';
import { proxyRequest } from '../proxy';
import { targetManager } from '../target-manager';
import { JsonRpcRequest } from './types';

export const router = express.Router();

// todo: use setting to convert to jsonrpc or not
const useJsonRpc = true;

router.head('/', (_, res) => res.send());
router.get('/user/devices', proxySmarthomeReq('discovery'));
router.post('/user/devices/query', proxySmarthomeReq('query'));
router.post('/user/devices/action', proxySmarthomeReq('action'));
router.post('/user/unlink', proxySmarthomeReq('unlink'));

function proxySmarthomeReq(rpcType: JsonRpcRequest['request_type']): RequestHandler {
  return async (req, res) => {
    logger.log(`${req.method} ${req.url}: ${JSON.stringify(req.body)}`);
    logger.log(`Authorization: ${req.get('Authorization')}`);
    let resBody: Record<string, unknown>;
    try {
      // пока всегда выбираем localhost при запросах умного дома
      const target = targetManager.getTarget('Локалхост');
      const reqBody = useJsonRpc ? convertRestToJsonRpc(rpcType, req) : req.body;
      resBody = await proxyRequest(target, {
        method: req.method,
        headers: convertToFetchHeaders(req.headers),
        body: JSON.stringify(reqBody),
      });
    } catch (e) {
      resBody = buildErrorBody(e);
    }
    logger.log(`Response: ${JSON.stringify(resBody)}`);
    res.json(resBody);
  };
}

function buildErrorBody(e: Error) {
  return {
    error_code: 'INTERNAL_ERROR',
    error_message: e.stack || e.message,
  };
}

function convertToFetchHeaders(reqHeaders: IncomingHttpHeaders) {
  const res: HeadersInit = {};
  Object.keys(reqHeaders).forEach(key => {
    const val = reqHeaders[key];
    if (typeof val === 'string') res[key] = val;
  });
  return res;
}

function convertRestToJsonRpc(rpcType: JsonRpcRequest['request_type'], req: Request): JsonRpcRequest {
  return {
    headers: {
      request_id: req.get('X-Request-Id')!,
      authorization: req.get('Authorization')!,
    },
    request_type: rpcType,
    payload: req.body.payload,
    api_version: '1.0'
  };
}
