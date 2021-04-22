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
    this.response = reply`pong`;
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
    this.response = null;
    this.resBody = null;
  }

  async run() {
    if (this.match()) {
      await this.reply();
      this.buildResBody();
      return this.resBody;
    }
  }

  buildResBody() {
    this.resBody = {
      response: this.response,
      state: this.state,
      version: '1.0'
    };
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
      || this.request.command.match(/список таргетов|покажи таргеты/);
  }

  reply() {
    this.response = reply`
      Выберите таргет:
      ${buttons(this.buttons())}
    `;
  }

  buttons() {
    return targets.map(target => {
      return {
        title: `Установи таргет ${target.name}`,
        hide: false
      };
    });
  }
};


/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";
module.exports = require("./targets");;

/***/ }),
/* 7 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply } = __webpack_require__(3);
const targets = __webpack_require__(6);
const BaseComponent = __webpack_require__(4);

module.exports = class SetTarget extends BaseComponent {
  match() {
    const matches = this.request.command.match(/(установи|поставь) таргет (.+)/);
    if (!matches) {
      return;
    }
    this.requestedTargetName = matches[2];
    this.foundTarget = targets.find(target => target.name === this.requestedTargetName);
    if (this.foundTarget) {
      this.state = this.state || {};
      this.state.application = {
        targetName: this.foundTarget.name
      };
    }
    return true;
  }

  reply() {
    this.response = this.replyTargetFound() || this.replyTargetNotFound();
  }

  replyTargetFound() {
    if (this.foundTarget) {
      return reply`
        Выбран таргет ${this.foundTarget.name}.
        Следующие запросы пойдут на него.
      `;
    }
  }

  replyTargetNotFound() {
    return reply`
      Таргет ${this.requestedTargetName} не найден.
    `;
  }
};


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
const SetTarget = __webpack_require__(7);
// const ProxyToUrl = require('./ProxyToUrl');
// const ProxyToQueue = require('./ProxyToQueue');

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
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