exports.handler = reqBody => {
  return {
    response: {
      text: `Вы сказали: ${reqBody.request.command}`,
    },
    version: '1.0'
  };
};
