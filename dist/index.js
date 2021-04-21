/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("console-log-level");;

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply } = __webpack_require__(3);
const BaseComponent = __webpack_require__(4);

module.exports = class PingPong extends BaseComponent {
  match() {
    return this.request.command === 'ping';
  }

  reply() {
    const response = reply`pong`;
    return { response };
  }
};


/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("alice-renderer");;

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = class BaseComponent {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = state;
    this.resBody = null;
  }

  async run() {
    if (this.match()) {
      this.resBody = await this.reply();
      this.resBody.version = '1.0';
      return this.resBody;
    }
  }
};


/***/ }),
/* 5 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply, buttons } = __webpack_require__(3);
const targets = __webpack_require__(6);
const BaseComponent = __webpack_require__(4);

module.exports = class ShowTargets extends BaseComponent {
  match() {
    const targetName = this.state?.application?.targetName;
    return !targetName
      || targets.every(target => target.name !== targetName)
      || this.request.command.match(/список таргетов|покажи таргеты/)
  }

  reply() {
    const response = reply`
      Выберите таргет для проксирования:
      ${buttons(this.replyButtons())}
    `;
    return { response };
  }

  replyButtons() {
    return targets.map(target => ({ title: target.name, hide: false }));
  }
};


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const fs = __webpack_require__(7);
const path = __webpack_require__(8);

const TARGETS_FILE = path.resolve(__dirname, 'targets.json');

module.exports = fs.existsSync(TARGETS_FILE)
  ? JSON.parse(fs.readFileSync(TARGETS_FILE, 'utf8'))
  : [];






/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
const logger = __webpack_require__(1)({ level: process.env.LOG_LEVEL || 'info' });
const PingPong = __webpack_require__(2);
const ShowTargets = __webpack_require__(5);
// const ChangeTarget = require('./ChangeTarget');
// const ProxyToUrl = require('./ProxyToUrl');
// const ProxyToQueue = require('./ProxyToQueue');

const Components = [
  PingPong,
  ShowTargets,
  // ChangeTarget,
  // ProxyToUrl,
  // ProxyToQueue,
];

exports.handler = async reqBody => {
  logger.info(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await proxyToComponent(reqBody);
  logger.info(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
};

async function proxyToComponent(reqBody) {
  for (const Component of Components) {
    const resBody = await new Component(reqBody).run();
    if (resBody) {
      return resBody;
    }
  }
}

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;