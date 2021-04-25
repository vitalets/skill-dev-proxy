exports.handler = reqBody => {
  console.log('');
  console.log('REQUEST', JSON.stringify(reqBody));
  const resBody = {
    response: {
      text: `Вы сказали: ${reqBody.request.command}`,
    },
    version: '1.0'
  };
  console.log('RESPONSE', JSON.stringify(resBody));
  return resBody;
};
