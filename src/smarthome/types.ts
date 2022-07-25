export type JsonRpcRequest = DiscoveryRequest | QueryRequest | ActionRequest | UnlinkRequest;

export type DiscoveryRequest = JsonRpcCommonProps & {
  request_type: 'discovery'
}

export type QueryRequest = JsonRpcCommonProps & {
  request_type: 'query',
  payload: {
    devices: QueryDevice[]
  }
}

export type ActionRequest = JsonRpcCommonProps & {
  request_type: 'action',
  payload: {
    devices: ActionDevice[]
  }
}

export type UnlinkRequest = JsonRpcCommonProps & {
  request_type: 'unlink'
}

export interface QueryDevice {
  id: string;
  custom_data?: Record<string, unknown>;
}

export interface ActionDevice {
  id: string;
  custom_data?: Record<string, unknown>;
  capabilities: ActionDeviceCapability[];
}

export interface ActionDeviceCapability {
  type: string;
  state: Record<string, unknown>;
}

type JsonRpcCommonProps = {
  headers: {
    request_id: string,
    authorization: string,
  },
  api_version: '1.0',
}
