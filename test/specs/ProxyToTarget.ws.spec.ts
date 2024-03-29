import Timeout from 'await-timeout';
import { createRequest, createResponse } from 'uni-skill';
import { Client } from '../../src/client/client';
import { ProxyToTarget } from '../../src/components/ProxyToTarget';

// skipped as used amqp transfer
describe.skip('ProxyToTarget (ws)', () => {

  let client: Client;

  const skill = (reqBody: unknown) => {
    const req = createRequest(reqBody);
    const res = createResponse(req);
    res.addVoiceText(`Вы сказали: ${req.userMessage}`);
    return res.body;
  };

  beforeEach(async () => {
    const wsUrl = User.config.webhookUrl;
    client = new Client({ wsUrl, handler: skill, logLevel: 'error' });
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

  it('error in handler', async () => {
    client.options.handler = () => { throw new Error('foo'); };
    const user = new User();

    await user.say('установи таргет локалхост');
    const consoleStub = sinon.stub(console, 'error');
    await user.say('привет');

    assert.include(user.response.text, 'Error: foo');
    sinon.assert.calledOnceWithMatch(consoleStub, `Error: foo`);
  });

  it('empty response from handler', async () => {
    client.options.handler = () => { return; };
    const user = new User();

    await user.say('установи таргет локалхост');
    const consoleStub = sinon.stub(console, 'error');
    await user.say('привет');

    assert.include(user.response.text, 'Empty response from handler');
    sinon.assert.calledOnceWithMatch(consoleStub, `Empty response from handler`);
  });

  it('timeout', async () => {
    sinon.stub(ProxyToTarget, 'TIMEOUT').value(100);
    client.options.handler = async () => {
      await Timeout.set(ProxyToTarget.TIMEOUT + 200);
      return {};
    };

    const user = new User();

    await user.say('установи таргет локалхост');
    await user.say('привет');

    assert.include(user.response.text, 'Таймаут таргета Локалхост');
    assert.include(user.response.tts, 'Таймаут таргета Локалхост');
  });
});
