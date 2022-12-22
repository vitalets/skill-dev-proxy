import { isYandexCloudEnv } from 'yandex-cloud-fn';
import { Ctx } from '../ctx';
import { memoryState } from './memory';
import { YdbState } from './ydb';

export interface StateData {
  selectedTarget?: string;
}

export interface IState {
  load(): Promise<StateData>;
  save(data: StateData): Promise<void>;
}

export class State {
  data: StateData = {};

  private manager: IState;

  constructor(ctx: Ctx) {
    const { functionId: ownerId, iamToken } = ctx.reqInfo;
    this.manager = isYandexCloudEnv
      ? new YdbState({ ownerId, iamToken })
      : memoryState;
  }

  async load() {
    this.data = await this.manager.load() || {};
  }

  async save() {
    await this.manager.save(this.data);
  }
}
