const fs = require('fs');
const path = require('path');

const TARGETS_FILE = path.resolve(__dirname, 'targets.json');

module.exports = fs.existsSync(TARGETS_FILE)
  ? JSON.parse(fs.readFileSync(TARGETS_FILE, 'utf8'))
  : [];




