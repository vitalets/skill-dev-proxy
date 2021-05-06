import { Ctx } from '../ctx';

export class Component {
  ctx: Ctx;

  constructor(ctx: Ctx) {
    this.ctx = ctx;
  }

  match() {
    return true;
  }

  async reply() {
    return;
  }
}
