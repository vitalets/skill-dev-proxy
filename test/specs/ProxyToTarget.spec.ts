// берем оттуда только значение таймаута,
// поэтому можно использовать даже при тестах ./dist
import { ProxyToTarget } from '../../src/components/ProxyToTarget';
import { isTestingDist } from '../setup';

describe('ProxyToTarget', () => {

  it('proxy to http (success)', async () => {
    const user = new User();

    const scope = nock('https://my-webhook.ru')
    .post('/', reqBody => reqBody.request.command === 'привет')
    .reply(200, {
      response: { text: 'куку' },
      application_state: { foo: 42 },
      version: '1.0'
    });

    await user.say('установи таргет навык 1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await user.say('привет', (reqBody: any) => reqBody.state.application.foo = 100);

    scope.done();
    assert.deepEqual(user.body, {
      response: { text: 'куку' },
      application_state: { targetName: 'навык 1', foo: 42 },
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
    // reduce timeout when testing ./src (not ./dist)
    if (!isTestingDist) {
      sinon.stub(ProxyToTarget, 'TIMEOUT').value(100);
    }
    const responseDelay = ProxyToTarget.TIMEOUT + 200;
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

