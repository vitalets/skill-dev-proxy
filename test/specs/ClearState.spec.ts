describe('Clear state', () => {

  it('clear application state for Alice', async () => {
    const user = new User();

    await user.say('очистить стейт', {
      state: {
        user: {
          foo: 1,
          bar: 2,
        },
        application: {
          baz: 3
        }
      }
    });

    assert.include(user.response.text, 'Стейт очищен');
    assert.deepEqual(user.body.application_state, {});
    assert.deepEqual(user.body.user_state_update, {
      foo: null,
      bar: null,
    });
  });

});

