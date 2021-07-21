describe('Clear state', () => {

  it('clear application state for Alice', async () => {
    const user = new User();

    await user.say('очистить стейт');

    assert.equal(user.response.text, 'Стейт сброшен.');
    assert.deepEqual(user.body.application_state, {});
  });

});

