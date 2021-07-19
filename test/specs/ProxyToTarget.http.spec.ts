import { ProxyToTarget } from '../../src/components/ProxyToTarget';

describe('ProxyToTarget (http)', () => {

  it('success', async () => {
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .reply(200, {
      response: { text: 'куку' },
      version: '1.0'
    });

    await user.say('установи таргет навык 1');
    await user.say('привет');

    scope.done();
    assert.deepEqual(user.body, {
      response: { text: 'куку' },
      version: '1.0'
    });
  });

  it('error', async () => {
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

  it('timeout', async () => {
    sinon.stub(ProxyToTarget, 'TIMEOUT').value(100);
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/')
    .delay(ProxyToTarget.TIMEOUT + 200)
    .reply(200);

    await user.say('установи таргет навык 1');
    await user.say('привет');

    scope.done();
    assert.include(user.response.text, 'Таймаут таргета Навык 1');
    assert.include(user.response.tts, 'Таймаут таргета Навык 1');
  });
});

