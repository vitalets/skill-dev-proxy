/**
 * WebSocket messages types.
 */

export type WsMessage = WsRequest | WsResponse;

export interface WsRequest {
  type: 'request',
  reqId: string,
  replyConnectionId: string,
  token: string,
  payload: string,
}

export interface WsResponse {
  type: 'response',
  reqId: string,
  payload: string,
}
