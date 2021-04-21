describe('ShowTargets', () => {

  const SHOW_TARGETS_KEYWORD = 'Выберите таргет';

  it('enter without target', async () => {
    const user = new User();

    await user.enter();

    assert.include(user.response.text, SHOW_TARGETS_KEYWORD);
    assert.equal(user.response.buttons.length, 3);
  });

  it('enter with invalid target', async () => {
    const state = { application: { targetName: 'blabla' }};
    const user = new User('', { state });

    await user.enter();

    assert.include(user.response.text, SHOW_TARGETS_KEYWORD);
  });

  it('show targets by command', async () => {
    const state = { application: { targetName: 'локалхост' }};
    const user = new User();

    await user.say('список таргетов', { state });

    assert.include(user.response.text, SHOW_TARGETS_KEYWORD);
  });
});

