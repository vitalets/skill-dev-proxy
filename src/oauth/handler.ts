import path from 'path';
import { RequestHandler } from 'express';
import { logger } from '../logger';

export const showOauthForm: RequestHandler = (req, res) => {
  const filePath = path.resolve(__dirname, './index.html');
  res.sendFile(filePath);
};

export const sendOauthToken: RequestHandler = (req, res) => {
  const resObj = {
    access_token: 'skill-dev-proxy-oauth-token',
    token_type: 'bearer',
    expires_in: 4_000_000_000,
  };
  logger.log(`Got oauth token request: ${JSON.stringify(req.body)}`);
  logger.log(`Send oauth token response: ${JSON.stringify(resObj)}`);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.json(resObj);
};
