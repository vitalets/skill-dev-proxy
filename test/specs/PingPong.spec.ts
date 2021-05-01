describe('PingPong', () => {

  it('respond with pong', async () => {
    const user = new User();

    await user.say('ping');

    assert.include(user.response.text, 'pong');
  });

});

