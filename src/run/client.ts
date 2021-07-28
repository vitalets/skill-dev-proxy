import { Client, ClientOptions } from '../client';

let client: Client;

export async function runClient(options: ClientOptions) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', handleRejection);
  client = new Client(options);
  await client.run();
}

async function shutdown(reason: string, exitCode = 0) {
  try {
    await client?.close();
  } catch (e) {
    logError(e);
  }
  setTimeout(() => process.exit(exitCode), 3000).unref();
}

function handleRejection(e: Error) {
  logError(e);
  shutdown('unhandledRejection', 1);
}

function logError(e: Error) {
  // eslint-disable-next-line no-console
  console.error(e);
}
