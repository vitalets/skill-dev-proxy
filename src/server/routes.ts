import { Application, RequestHandler } from 'express';
import { targetManager } from '../target-manager';
import { handleUserMessage } from '../handler';
import { router as oauthRouter } from '../smarthome/oauth';
import { router as smarthomeRouter } from '../smarthome/routes';

export function setRoutes(app: Application) {
  app.use('/oauth', oauthRouter);
  app.use('/v1.0', smarthomeRouter);
  app.get('*', showTargets);
  app.post('*', skillHandler);
}

const showTargets: RequestHandler = (req, res) => {
  const targetNames = targetManager.targets.map(target => target.name).join(', ');
  res.send(`Работает. Таргеты: ${targetNames}`);
};

const skillHandler: RequestHandler = (async (req, res) => {
  const resBody = await handleUserMessage(req.body);
  res.json(resBody);
});
