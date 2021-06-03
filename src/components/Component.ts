import { Ctx } from '../ctx';

export class Component {
  ctx: Ctx;

  constructor(ctx: Ctx) {
    this.ctx = ctx;
  }

  match(): boolean | undefined {
    return true;
  }

  async reply() { // eslint-disable-line @typescript-eslint/no-empty-function

  }
}
