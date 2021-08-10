import { server } from '../server';
import { targetManager } from '../target-manager';
import { logger } from '../logger';
import { config } from '../config';

run();

async function run() {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', handleRejection);
  targetManager.init(config.targets);
  await server.start(config.port);
}

async function shutdown(reason: string, exitCode = 0) {
  logger.log(`Shutdown due to: ${reason}`);
  try {
    await server.stop();
  } catch (e) {
    logger.error(e);
  }
  setTimeout(() => process.exit(exitCode), 3000).unref();
}

function handleRejection(error: Error) {
  logger.error(error);
  shutdown('unhandledRejection', 1);
}

