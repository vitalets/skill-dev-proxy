/**
 * Universal skill request.
 */

export abstract class BaseRequest {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static match(reqBody: unknown): boolean { throw new Error('Not implemented.'); }
  isAlice() { return false; }
  isSber() { return false; }
  isMarusya() { return false; }
}

export type State = Record<string, unknown> | undefined;

export interface IRequest {
  body: unknown;
  isAlice(): boolean;
  isSber(): boolean;
  isMarusya(): boolean;
  readonly userId: string;
  readonly userMessage: string;
  readonly isNewSession: boolean;
  readonly userState: State;
  // not supported in Marusya
  // readonly applicationState: State;
  readonly sessionState: State;
}
