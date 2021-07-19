describe('ShowTargets', () => {

  const SHOW_TARGETS_KEYWORD = 'Выберите таргет';

  it('enter without target', async () => {
    const user = new User();

    await user.enter();

    assert.include(user.response.text, SHOW_TARGETS_KEYWORD);
    assert.equal(user.response.buttons.length, 2);
  });

  it('show targets by command', async () => {
    const user = new User();
    user.state.application = { targetName: 'локалхост' };

    await user.say('список таргетов');

    assert.include(user.response.text, SHOW_TARGETS_KEYWORD);
  });
});

