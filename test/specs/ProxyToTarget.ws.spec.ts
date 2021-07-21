import { ReqBody } from 'alice-types';
import Timeout from 'await-timeout';
import { Client } from '../../src/client';
import { ProxyToTarget } from '../../src/components/ProxyToTarget';

describe('ProxyToTarget (ws)', () => {

  let client: Client;

  const skill = (reqBody: ReqBody) => {
    return {
      response: {
        text: `Вы сказали: ${reqBody.request.command}`,
      },
      version: '1.0'
    };
  };

  beforeEach(async () => {
    const wsUrl = User.config.webhookUrl;
    client = new Client({ wsUrl, handler: skill, logging: false });
    await client.run();
  });

  afterEach(async () => {
    await client?.close();
  });

  it('success', async () => {
    const user = new User();

    await user.say('установи таргет локалхост');
    await user.say('привет');

    assert.include(user.response.text, 'Вы сказали: привет');
  });

  it('no clients', async () => {
    await client.close();
    const user = new User();

    await user.say('установи таргет локалхост');
    await user.say('привет');

    assert.include(user.response.text, 'Нет получателей! Нужно запустить скрипт на локалхосте.');
  });

  it('error', async () => {
    client.options.handler = () => { throw new Error('foo'); };
    const user = new User();

    await user.say('установи таргет локалхост');

    const consoleStub = sinon.stub(console, 'error');
    await user.say('привет');

    assert.include(user.response.text, 'Error: foo');
    sinon.assert.calledOnceWithMatch(consoleStub, `Error: foo`);
  });

  it('timeout', async () => {
    sinon.stub(ProxyToTarget, 'TIMEOUT').value(100);
    client.options.handler = () => Timeout.set(ProxyToTarget.TIMEOUT + 200);

    const user = new User();

    await user.say('установи таргет локалхост');
    await user.say('привет');

    assert.include(user.response.text, 'Таймаут таргета Локалхост');
    assert.include(user.response.tts, 'Таймаут таргета Локалхост');
  });
});