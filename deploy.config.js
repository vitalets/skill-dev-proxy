require('dotenv/config');
const fs = require('fs');
// const path = require('path');
// const dotenv = require('dotenv');
// const envProd = dotenv.parse(fs.readFileSync(path.resolve(__dirname, './.env.prod')));

const targets = JSON.parse(fs.readFileSync('.env.targets.json', 'utf8'));

module.exports = {
  useCliConfig: true,
  functionName: 'skill-dev-proxy',
  deploy: {
    files: [ 'package*.json', 'dist/**' ],
    handler: 'dist/serverless/index.handler',
    runtime: 'nodejs16',
    timeout: 5,
    memory: 128,
    account: 'skill-dev-proxy-sa',
    environment: {
      NODE_ENV: 'production',
      TARGETS: JSON.stringify(targets),
      // AMQP_URL: process.env.AMQP_URL,
      YDB_NAME: process.env.YDB_NAME,
      STUB_WS_URL: process.env.STUB_WS_URL,
      LIVE_DEBUG_YDB_NAME: process.env.LIVE_DEBUG_YDB_NAME,
    },
  },
};
