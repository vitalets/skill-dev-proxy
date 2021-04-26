const logger = require('./logger');
const Ctx = require('./ctx');
const PingPong = require('./PingPong');
const ShowTargets = require('./ShowTargets');
const SetTarget = require('./SetTarget');
const ProxyToTarget = require('./ProxyToTarget');

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
  ProxyToTarget,
  ShowTargets,
];

exports.handler = async reqBody => {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const ctx = new Ctx(reqBody);
  await runComponents(ctx);
  logger.log(`RESPONSE: ${JSON.stringify(ctx.resBody)}`);
  return ctx.resBody;
};

async function runComponents(ctx) {
  for (const Component of Components) {
    await runComponent(Component, ctx);
    if (ctx.resBody) {
      return;
    }
  }

  const LastComponent = Components[Components.length - 1];
  await runComponent(LastComponent, ctx, { force: true });
}

async function runComponent(Component, ctx, { force } = {}) {
  const component = new Component();
  component.ctx = ctx;
  if (component.match() || force) {
    await component.reply();
    ctx.buildResBody();
  }
}
