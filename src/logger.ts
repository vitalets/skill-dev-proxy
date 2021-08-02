import consoleLogLevel, { LogLevelNames } from 'console-log-level';
import { config } from './config';

export { LogLevelNames };
export type Logger = Record<LogLevelNames | 'log', (...args: unknown[]) => void>;
export function createLogger(...args: Parameters<typeof consoleLogLevel>) {
  const logger = consoleLogLevel(...args) as Logger;
  logger.log = logger.info;
  return logger;
}
export const logger = createLogger({ level: config.logLevel as LogLevelNames });
