const logger = require('./logger');
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
  const resBody = await handleByComponent(reqBody);
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
};

async function handleByComponent(reqBody) {
  for (const Component of Components) {
    const resBody = await new Component(reqBody).run();
    if (resBody) {
      return resBody;
    }
  }

  const LastComponent = Components[Components.length - 1];
  return new LastComponent(reqBody).run({ force: true });
}
