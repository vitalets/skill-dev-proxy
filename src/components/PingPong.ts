import { Component } from './Component';
import { reply } from 'alice-renderer';

export class PingPong extends Component {
  match() {
    return this.ctx.userMessage === 'ping';
  }

  async reply() {
    this.ctx.response = reply`pong`;
  }
}
