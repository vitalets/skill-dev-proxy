// const fs = require('fs');
// const path = require('path');
// const dotenv = require('dotenv');
// const envProd = dotenv.parse(fs.readFileSync(path.resolve(__dirname, './.env.prod')));

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
      //YDB_NAME: envProd.YDB_NAME,
    },
  },
};
