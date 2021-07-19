import { server } from '../http/server';
import { targetManager } from '../target-manager';
import { logger } from '../logger';
import { port, targets } from '../env';

run();

async function run() {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', handleRejection);
  targetManager.init(targets);
  await server.start(port);
}

async function shutdown(reason: string, exitCode = 0) {
  logger.log(`Shutdown due to: ${reason}`);
  try {
    await server.stop();
  } catch (e) {
    logger.error(e);
  }
  process.exit(exitCode);
}

function handleRejection(error: Error) {
  logger.error(error);
  shutdown('unhandledRejection', 1);
}

