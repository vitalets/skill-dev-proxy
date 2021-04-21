const logger = require('console-log-level')({ level: process.env.LOG_LEVEL || 'info' });
const PingPong = require('./PingPong');
const ShowTargets = require('./ShowTargets');
// const ChangeTarget = require('./ChangeTarget');
// const ProxyToUrl = require('./ProxyToUrl');
// const ProxyToQueue = require('./ProxyToQueue');

const Components = [
  PingPong,
  ShowTargets,
  // ChangeTarget,
  // ProxyToUrl,
  // ProxyToQueue,
];

exports.handler = async reqBody => {
  logger.info(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await proxyToComponent(reqBody);
  logger.info(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
};

async function proxyToComponent(reqBody) {
  for (const Component of Components) {
    const resBody = await new Component(reqBody).run();
    if (resBody) {
      return resBody;
    }
  }
}
