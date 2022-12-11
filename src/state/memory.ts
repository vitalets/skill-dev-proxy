import { IState, StateData } from '.';

export class MemoryState implements IState {
    protected data: StateData = {};

    async load(): Promise<StateData> {
      return this.data;
    }

    async save(data: StateData) {
      this.data = data;
    }
}

export const memoryState = new MemoryState();
