/**
 * See: https://yandex.ru/dev/dialogs/smart-home/doc/reference/resources.html
 */
import express, { Request } from 'express';
import asyncHandler from 'express-async-handler';
import { IncomingHttpHeaders } from 'http';
import { logger } from '../logger';
import { proxyRequest } from '../proxy';
import { isLocalhostTarget, targetManager } from '../target-manager';

export const router = express.Router();

type JsonRpcRequestType = 'discovery' | 'query' | 'action' | 'unlink';

// todo: use setting to convert to jsonrpc or not
const useJsonRpc = true;

const proxySmarthomeReq = (rpcType: JsonRpcRequestType) => {
  return asyncHandler(async (req, res) => {
    logger.log(`${req.method} ${req.url}: ${JSON.stringify(req.body)}`);
    logger.log(`Authorization: ${req.get('Authorization')}`);
    let resBody: Record<string, unknown>;
    try {
      selectLocalhostTarget();
      const reqBody = useJsonRpc ? convertRestToJsonRpc(rpcType, req) : req.body;
      resBody = await proxyRequest({
        method: req.method,
        headers: convertToFetchHeaders(req.headers),
        body: JSON.stringify(reqBody),
      });
    } catch (e) {
      resBody = buildErrorBody(e);
    }
    logger.log(`Response: ${JSON.stringify(resBody)}`);
    res.json(resBody);
  });
};

router.head('/', (_, res) => res.send());
router.get('/user/devices', proxySmarthomeReq);
router.post('/user/devices/query', proxySmarthomeReq);
router.post('/user/devices/action', proxySmarthomeReq);
router.post('/user/unlink', proxySmarthomeReq);

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

function convertRestToJsonRpc(rpcType: JsonRpcRequestType, req: Request) {
  return {
    headers: {
      request_id: req.get('X-Request-Id'),
      authorization: req.get('Authorization'),
    },
    request_type: rpcType,
    payload: req.body,
    api_version: '1.0'
  };
}

// пока всегда выбираем localhost при запросах умного дома
function selectLocalhostTarget() {
  if (!isLocalhostTarget(targetManager.selectedTarget)) {
    targetManager.selectedTarget = targetManager.targets.find(target => isLocalhostTarget(target)) || null;
  }
}
