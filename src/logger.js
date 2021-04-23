const logger = require('console-log-level')({
  level: process.env.LOG_LEVEL || 'info'
});

logger.log = logger.info;

module.exports = logger;
