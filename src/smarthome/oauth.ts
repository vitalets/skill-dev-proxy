import path from 'path';
import express from 'express';
import { logger } from '../logger';

export const router = express.Router();

router.get('/', (req, res) => {
  const filePath = path.resolve(__dirname, './oauth.html');
  res.sendFile(filePath);
});

router.post('/token', (req, res) => {
  const resObj = {
    access_token: 'skill-dev-proxy-oauth-token',
    token_type: 'bearer',
    expires_in: 4_000_000_000,
  };
  // {"code":"skill-dev-proxy-oauth-code","client_secret":"skill-dev-proxy-secret","grant_type":"authorization_code","client_id":"skill-dev-proxy","redirect_uri":"https://social.yandex.net/broker/redirect"}
  logger.log(`Got oauth token request: ${JSON.stringify(req.body)}`);
  logger.log(`Send oauth token response: ${JSON.stringify(resObj)}`);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.json(resObj);
});
