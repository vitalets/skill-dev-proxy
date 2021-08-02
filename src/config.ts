export const config = {
  port: Number(process.env.PORT || 3000),
  targets: process.env.TARGETS || '',
  logLevel: process.env.LOG_LEVEL || 'info',
};
