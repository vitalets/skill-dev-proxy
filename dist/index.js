/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const logger = __webpack_require__(2)({
  level: process.env.LOG_LEVEL || 'info'
});

logger.log = logger.info;

module.exports = logger;


/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("console-log-level");;

/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply } = __webpack_require__(4);
const Component = __webpack_require__(5);

module.exports = class PingPong extends Component {
  match() {
    return this.request.command === 'ping';
  }

  reply() {
    this.response = reply`pong`;
  }
};


/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("alice-renderer");;

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = class Component {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.applicationState = state && state.application || null;
    this.response = null;
    this.resBody = null;
  }

  async run({ force } = {}) {
    if (force || this.match()) {
      await this.reply();
      this.buildResBody();
      return this.resBody;
    }
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response,
        application_state: this.applicationState,
        version: '1.0',
      };
    }
  }
};


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply, buttons } = __webpack_require__(4);
const targets = __webpack_require__(7);
const Component = __webpack_require__(5);

module.exports = class ShowTargets extends Component {
  match() {
    return this.request.command.match(/список таргетов|покажи таргеты/);
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
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("./targets");;

/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply } = __webpack_require__(4);
const targets = __webpack_require__(7);
const Component = __webpack_require__(5);

module.exports = class SetTarget extends Component {
  match() {
    const matches = this.request.command.match(/(установи|поставь) таргет (.+)/);
    if (!matches) {
      return;
    }
    this.requestedTargetName = matches[2];
    this.target = targets.find(target => target.name.toLowerCase() === this.requestedTargetName);
    if (this.target) {
      this.applicationState = { targetName: this.target.name };
    }
    return true;
  }

  reply() {
    this.response = this.replyTargetFound() || this.replyTargetNotFound();
  }

  replyTargetFound() {
    if (this.target) {
      return reply`
        Выбран таргет ${this.target.name}.
      `;
    }
  }

  replyTargetNotFound() {
    return reply`
      Таргет ${this.requestedTargetName} не найден.
    `;
  }
};


/***/ }),
/* 9 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply, text, tts } = __webpack_require__(4);
const Timeout = __webpack_require__(10);
const getFetch = () => __webpack_require__(11);
const logger = __webpack_require__(1);
const targets = __webpack_require__(7);
const Component = __webpack_require__(5);

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

class ProxyToTarget extends Component {
  match() {
    const targetName = this.applicationState?.targetName;
    this.target = targets.find(target => target.name.toLowerCase() === targetName);
    return Boolean(this.target);
  }

  async reply() {
    try {
      await Timeout.wrap(
        this.proxyRequest(),
        ProxyToTarget.TIMEOUT,
        `Таймаут таргета ${this.target.name}`
      );
    } catch (e) {
      this.replyError(e);
    }
  }

  async proxyRequest() {
    if (this.isQueueTarget()) {
      await this.proxyToQueue();
    } else {
      await this.proxyToUrl();
    }
  }

  isQueueTarget() {
    return this.target.url.startsWith(ProxyToTarget.QUEUE_URL_PREFIX);
  }

  async proxyToUrl() {
    const fetch = getFetch();
    const url = this.target.url;
    logger.log(`PROXY TO: ${url}`);
    const body = JSON.stringify(this.reqBody);
    const response = await fetch(url, { method: 'POST', headers: HEADERS, body });
    if (response.ok) {
      this.resBody = await response.json();
    } else {
      const message = [response.status, response.statusText, await response.text()].filter(Boolean).join(' ');
      throw new Error(message);
    }
  }

  async proxyToQueue() {

  }

  replyError(e) {
    logger.log(e);
    this.response = reply`
      ${tts('Ошибка')}
      ${text(e.message)}
    `;
  }
}

// webpack can't parse static class props out of box.
// So use this assignment instead of installing babel-loader and complexify configuration.
ProxyToTarget.QUEUE_URL_PREFIX = 'https://message-queue.api.cloud.yandex.net';
ProxyToTarget.TIMEOUT = 2800;

module.exports = ProxyToTarget;


/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("await-timeout");;

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = require("node-fetch");;

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
const logger = __webpack_require__(1);
const PingPong = __webpack_require__(3);
const ShowTargets = __webpack_require__(6);
const SetTarget = __webpack_require__(8);
const ProxyToTarget = __webpack_require__(9);
// const ProxyToQueue = require('./ProxyToQueue');

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
  ProxyToTarget,
  ShowTargets,
];

exports.handler = async reqBody => {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const resBody = await handleByComponent(reqBody);
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
  return resBody;
};

async function handleByComponent(reqBody) {
  for (const Component of Components) {
    const resBody = await new Component(reqBody).run();
    if (resBody) {
      return resBody;
    }
  }

  const LastComponent = Components[Components.length - 1];
  return new LastComponent(reqBody).run({ force: true });
}

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;