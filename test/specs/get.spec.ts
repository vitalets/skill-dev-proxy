import fetch from 'node-fetch';

describe('get request', () => {

  it('show targets', async () => {
    const res = await fetch(User.config.webhookUrl, { method: 'get' });
    const resBody = await res.text();
    assert.equal(resBody, 'Работает. Таргеты:\nЛокалхост\nНавык 1');
  });

});

