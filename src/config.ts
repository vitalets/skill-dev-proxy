export const config = {
  port: Number(process.env.PORT || 3000),
  targets: process.env.TARGETS || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  ydbName: process.env.YDB_NAME || '',
  ydbPath: 'skill-dev-proxy',
  amqpUrl: process.env.AMQP_URL || '',
  stubWsUrl: process.env.STUB_WS_URL || '',
  stubId: 'skill-dev-proxy',
  liveDebugYdbName: process.env.LIVE_DEBUG_YDB_NAME || '',
};
