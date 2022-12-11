import { AmqpClient, AmqpClientOptions } from './amqpClient';
import { Client, ClientOptions } from './client';

export {
  Client,
  AmqpClient,
};

let client: Client | AmqpClient;

export async function runClient(options: ClientOptions | AmqpClientOptions) {
  listenExitSignals();
  client = 'amqpUrl' in options
    ? new AmqpClient(options)
    : new Client(options);
  await client.run();
  return client; // for debug
}

function listenExitSignals() {
    // Use once instead of on (when running via npm SIGINT comes twice)
    // see: https://stackoverflow.com/questions/54722158/node-and-npm-running-script-and-ctrl-c-triggers-sigint-twice
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('unhandledRejection', handleRejection);
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
