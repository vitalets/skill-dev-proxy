import { Application, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { targetManager } from '../target-manager';
import { handleUserMessage } from '../handler';
import { sendOauthToken, showOauthForm } from '../oauth/handler';

export function setRoutes(app: Application) {
  app.get('/oauth', showOauthForm);
  app.get('*', showTargets);
  app.post('/oauth/token', sendOauthToken);
  app.post('*', skillHandler);
}

const showTargets: RequestHandler = (req, res) => {
  const targetNames = targetManager.targets.map(target => target.name).join(', ');
  res.send(`Работает. Таргеты: ${targetNames}`);
};

const skillHandler: RequestHandler = asyncHandler(async (req, res) => {
  const resBody = await handleUserMessage(req.body);
  res.json(resBody);
});
