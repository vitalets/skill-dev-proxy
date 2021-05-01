import consoleLogLevel from 'console-log-level';

const level = (process.env.LOG_LEVEL || 'info') as consoleLogLevel.LogLevelNames;

type Logger = Record<consoleLogLevel.LogLevelNames | 'log', (...args: unknown[]) => void>;

export const logger = consoleLogLevel({ level }) as Logger;

logger.log = logger.info;
