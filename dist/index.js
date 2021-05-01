"use strict";
const logger_1 = require("./logger");
const ctx_1 = require("./ctx");
const targets_1 = require("./targets");
const PingPong_1 = require("./components/PingPong");
const SetTarget_1 = require("./components/SetTarget");
const ShowTargets_1 = require("./components/ShowTargets");
const ProxyToTarget_1 = require("./components/ProxyToTarget");
const Components = [
    PingPong_1.PingPong,
    SetTarget_1.SetTarget,
    ShowTargets_1.ShowTargets,
    ProxyToTarget_1.ProxyToTarget,
    ShowTargets_1.ShowTargets,
];
function createHandler(targets) {
    targets_1.targetManager.targets = targets;
    return async (reqBody) => {
        logger_1.logger.log(`REQUEST: ${JSON.stringify(reqBody)}`);
        const ctx = new ctx_1.Ctx(reqBody);
        await runComponents(ctx);
        logger_1.logger.log(`RESPONSE: ${JSON.stringify(ctx.resBody)}`);
        return ctx.resBody;
    };
}
async function runComponents(ctx) {
    for (const C of Components) {
        await runComponent(C, ctx);
        if (ctx.resBody) {
            return;
        }
    }
    const LastComponent = Components[Components.length - 1];
    await runComponent(LastComponent, ctx, { force: true });
}
async function runComponent(C, ctx, { force = false } = {}) {
    const component = new C(ctx);
    if (component.match() || force) {
        await component.reply();
        ctx.buildResBody();
    }
}
module.exports = createHandler;
