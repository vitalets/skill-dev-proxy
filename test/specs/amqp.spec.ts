import { ReqBody } from 'alice-types';
import { Connection } from 'amqplib';
import { isTestingDist, getSrc } from '../setup';

const { AMQP_URL = '' } = process.env;

describe('amqp (e2e)', () => {
  const skill = (reqBody: ReqBody) => {
    return {
      response: {
        text: `Вы сказали: ${reqBody.request.command}`,
      },
      version: '1.0'
    };
  };

  let connection: Connection;
  let user: typeof User;

  before(async function () {
    if (isTestingDist) {
      const { getHandler, waitMessages } = await getSrc();
      user = new User(getHandler([ { name: 'Локалхост', url: AMQP_URL } ]));
      connection = await waitMessages({ amqpUrl: AMQP_URL, handler: skill, logging: false });
    } else {
      this.skip();
    }
  });

  after(async () => {
    await connection?.close();
    // вызываем смену таргета, чтобы закрыть amqp коннект
    await user?.say('установи таргет локалхост');
  });

  it('proxy to amqp and handle in waitMessages', async () => {
    await user.say('установи таргет локалхост');
    await user.say('привет');
    assert.equal(user.response.text, 'Вы сказали: привет');
  });

});
