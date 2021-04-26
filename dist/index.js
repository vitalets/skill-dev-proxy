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
/***/ ((module) => {

module.exports = class Ctx {
  constructor(reqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = state && state.application || {};
    this.response = null;
    this.resBody = null;

    this.command = this.request.command;
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response,
        version: '1.0',
      };
    }

    if (Object.keys(this.state).length > 0) {
      this.resBody.application_state = Object.assign({}, this.resBody.application_state, this.state);
    }
  }
};


/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply } = __webpack_require__(5);

module.exports = class PingPong {
  match() {
    return this.ctx.command === 'ping';
  }

  reply() {
    this.ctx.response = reply`pong`;
  }
};


/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = require("alice-renderer");;

/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply, buttons } = __webpack_require__(5);
const targets = __webpack_require__(7);

module.exports = class ShowTargets {
  match() {
    return this.ctx.command.match(/список таргетов|покажи таргеты/);
  }

  reply() {
    this.ctx.response = reply`
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

const { reply } = __webpack_require__(5);
const { findTargetByName } = __webpack_require__(9);

module.exports = class SetTarget {
  match() {
    const matches = this.ctx.request.command.match(/(установи|поставь) (таргет|target) (.+)/);
    if (!matches) {
      return;
    }
    this.requestedTargetName = matches[3];
    this.target = findTargetByName(this.requestedTargetName);
    if (this.target) {
      this.ctx.state.targetName = this.target.name;
    }
    return true;
  }

  reply() {
    this.ctx.response = this.replyTargetFound() || this.replyTargetNotFound();
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const targets = __webpack_require__(7);

exports.findTargetByName = targetName => {
  targetName = (targetName || '').toLowerCase();
  return targets.find(target => {
    return (target.name.toLowerCase() === targetName) || (target.match && target.match.test(targetName));
  });
};


/***/ }),
/* 10 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { reply, text, tts } = __webpack_require__(5);
const Timeout = __webpack_require__(11);
const logger = __webpack_require__(1);
const { findTargetByName } = __webpack_require__(9);

const TARGET_TYPES = {
  http: __webpack_require__(12),
  amqp: __webpack_require__(14),
};

class ProxyToTarget {
  match() {
    this.target = findTargetByName(this.ctx.state.targetName);
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
    logger.log(`PROXY TO TARGET: ${this.target.name}`);
    const protocol = new URL(this.target.url).protocol.replace(/s?:$/, '');
    const { proxy } = TARGET_TYPES[protocol];
    this.ctx.resBody = await proxy({ url: this.target.url, reqBody: this.ctx.reqBody });
  }

  replyError(e) {
    logger.log(e);
    const message = e.stack.split('\n').slice(0, 2).join('\n');
    this.ctx.response = reply`
      ${tts('Ошибка')}
      ${text(message)}
    `;
  }
}

// webpack can't parse static class props out of box.
// So use this assignment instead of installing babel-loader and complexify configuration.
ProxyToTarget.TIMEOUT = 2800;

module.exports = ProxyToTarget;


/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = require("await-timeout");;

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * Proxy to http url.
 */
const getFetch = () => __webpack_require__(13);

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
const method = 'POST';

exports.proxy = async ({ url, reqBody }) => {
  const fetch = getFetch();
  const body = JSON.stringify(reqBody);
  const response = await fetch(url, { method, headers, body });
  return response.ok
    ? response.json()
    : await throwResponseError(response);
};

async function throwResponseError(response) {
  const message = [response.status, response.statusText, await response.text()].filter(Boolean).join(' ');
  throw new Error(message);
}


/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";
module.exports = require("node-fetch");;

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * Proxy as message to amqp broker and wait response.
 */

const getAmqp = () => __webpack_require__(15);

const FROM_USER_QUEUE = 'from-user';
const FROM_SKILL_QUEUE = 'from-skill';

let conn;
let channel;

exports.proxy = async ({ url, reqBody }) => {
  const amqp = getAmqp();
  conn = conn || await amqp.connect(url);
  channel = channel || await conn.createChannel();
  await sendMessage(JSON.stringify(reqBody));
  return JSON.parse(await waitMessage());
};

async function sendMessage(message) {
  const { consumerCount } = await channel.assertQueue(FROM_USER_QUEUE);
  if (consumerCount === 0) {
    throw new Error('Нет получателей! Нужно запустить скрипт на локалхосте.');
  }
  await channel.sendToQueue(FROM_USER_QUEUE, Buffer.from(message), { expiration: 1000 });
}

async function waitMessage() {
  let resolve;
  const promise = new Promise(r => resolve = r);
  await channel.assertQueue(FROM_SKILL_QUEUE);
  const { consumerTag } = await channel.consume(FROM_SKILL_QUEUE, msg => {
    resolve(msg.content.toString());
  }, {noAck: true});
  promise.then(() => channel.cancel(consumerTag));
  return promise;
}


/***/ }),
/* 15 */
/***/ ((module) => {

"use strict";
module.exports = require("amqplib");;

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
const Ctx = __webpack_require__(3);
const PingPong = __webpack_require__(4);
const ShowTargets = __webpack_require__(6);
const SetTarget = __webpack_require__(8);
const ProxyToTarget = __webpack_require__(10);

const Components = [
  PingPong,
  SetTarget,
  ShowTargets,
  ProxyToTarget,
  ShowTargets,
];

exports.handler = async reqBody => {
  logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
  const ctx = new Ctx(reqBody);
  await runComponents(ctx);
  logger.log(`RESPONSE: ${JSON.stringify(ctx.resBody)}`);
  return ctx.resBody;
};

async function runComponents(ctx) {
  for (const Component of Components) {
    await runComponent(Component, ctx);
    if (ctx.resBody) {
      return;
    }
  }

  const LastComponent = Components[Components.length - 1];
  await runComponent(LastComponent, ctx, { force: true });
}

async function runComponent(Component, ctx, { force } = {}) {
  const component = new Component();
  component.ctx = ctx;
  if (component.match() || force) {
    await component.reply();
    ctx.buildResBody();
  }
}

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;