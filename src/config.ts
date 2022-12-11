export const config = {
  port: Number(process.env.PORT || 3000),
  targets: process.env.TARGETS || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  ydbName: process.env.YDB_NAME || '',
  ydbPath: 'skill-dev-proxy',
};
