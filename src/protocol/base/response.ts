/**
 * Universal skill response.
 */
import { State } from './request';

export abstract class BaseResponse {
  isAlice() { return false; }
  isSber() { return false; }
  isMarusya() { return false; }
}

export interface IResponse {
  body: unknown;
  data: unknown;
  userState: State;
  // not supported in Marusya
  // applicationState: State;
  sessionState: State;
}
