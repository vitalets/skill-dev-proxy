import { ReqBody, Request, Session, ResBody, Response } from 'alice-types';

interface State {
  targetName?: string;
}

export class Ctx {
  reqBody: ReqBody;
  request: Request;
  session: Session;
  state: State;
  resBody?: ResBody;
  response?: Response;
  msg: string;

  constructor(reqBody: ReqBody) {
    const { request, session, state } = reqBody;
    this.reqBody = reqBody;
    this.request = request;
    this.session = session;
    this.state = (state && state.application || {}) as State;
    this.msg = normalizeMessage(this.request.command);
  }

  buildResBody() {
    if (!this.resBody) {
      this.resBody = {
        response: this.response!,
        version: '1.0',
      };
    }

    if (Object.keys(this.state).length > 0) {
      this.resBody.application_state = Object.assign({}, this.resBody.application_state, this.state);
    }
  }
}

/**
 * Normalize message:
 * - lowercase
 * - ё -> е
 * - remove waste words (if there are other words)
 * - remove extra spaces
 * - trim
 */
 export function normalizeMessage(msg?: string) {
  return (msg || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^а-яa-z0-9]/g, ' ') // оставляем только буквы и цифры
   // .replace(/алиса/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
