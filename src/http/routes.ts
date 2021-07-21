import { Application, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { targetManager } from '../target-manager';
import { handleUserMessage } from '../handler';

export function setRoutes(app: Application) {
  app.get('*', showTargets);
  app.post('*', skillHandler);
}

const showTargets: RequestHandler = (req, res) => {
  const targetNames = targetManager.targets.map(target => target.name).join('\n');
  res.send(`Работает. Таргеты:\n${targetNames}`);
};

const skillHandler: RequestHandler = asyncHandler(async (req, res) => {
  const resBody = await handleUserMessage(req.body);
  res.json(resBody);
});

