describe('ProxyToTarget', () => {

  it('proxy to http (success)', async () => {
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/', reqBody => reqBody.request.command === 'привет')
    .reply(200, {
      response: { text: 'куку' },
      version: '1.0'
    });

    await user.say('установи таргет навык 1');
    await user.say('привет');

    scope.done();
    assert.deepEqual(user.body, {
      response: { text: 'куку' },
      application_state: { targetName: 'навык 1' },
      version: '1.0'
    });
  });

  it('proxy to http (error)', async () => {
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .reply(500, 'something broken');

    await user.say('установи таргет навык 1');
    await user.say('привет');

    scope.done();
    assert.include(user.response.text, '500 Internal Server Error something broken');
    assert.include(user.response.tts, 'Ошибка');
    assert.deepEqual(user.response.buttons, [
      { title: 'Список таргетов', hide: true }
    ]);
  });

  it('proxy to http (timeout)', async function () {
    let timeout = 2800;
    if (!process.env.HANDLER_PATH) {
      // when testing src (not dist), we can reduce TIMEOUT of ProxyToTarget class.
      const { ProxyToTarget } = await import('../../src/components/ProxyToTarget');
      timeout = ProxyToTarget.TIMEOUT = 100;
    }
    const responseDelay = timeout + 200;
    this.timeout(responseDelay);

    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .delay(responseDelay)
    .reply(200);

    await user.say('установи таргет навык 1');
    await user.say('привет');

    scope.done();
    assert.include(user.response.text, 'Таймаут таргета навык 1');
    assert.include(user.response.tts, 'Таймаут таргета навык 1');
  });

});

