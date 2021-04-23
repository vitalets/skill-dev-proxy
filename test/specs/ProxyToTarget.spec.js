describe('ProxyToTarget', () => {

  it('proxy to url (success)', async () => {
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .reply(200, {
      response: {
        text: 'куку',
      },
      version: '1.0'
    });

    await user.say('установи таргет навык 2');
    await user.say('привет');

    scope.done();
    assert.deepEqual(user.body, {
      response: {
        text: 'куку',
      },
      version: '1.0'
    });
  });

  it('proxy to url (error)', async () => {
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .reply(500, 'something broken');

    await user.say('установи таргет навык 2');
    await user.say('привет');

    scope.done();
    assert.include(user.response.text, '500 Internal Server Error something broken');
    assert.include(user.response.tts, 'Ошибка');
  });

  it('proxy to url (timeout)', async function () {
    let timeout = 2800;
    if (!process.env.HANDLER_PATH) {
      // when testing src (not dist), we can change TIMEOUT of ProxyToTarget class.
      const ProxyToTarget = require('../../src/ProxyToTarget');
      timeout = ProxyToTarget.TIMEOUT = 100;
    }
    const responseDelay = timeout + 100;
    this.timeout(responseDelay);

    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .delay(responseDelay)
    .reply(200);

    await user.say('установи таргет навык 2');
    await user.say('привет');

    scope.done();
    assert.include(user.response.text, 'Таймаут таргета навык 2');
    assert.include(user.response.tts, 'Ошибка');
  });

});

