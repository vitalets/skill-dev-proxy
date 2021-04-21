describe('SetTarget', () => {

  const SET_TARGET_KEYWORD = 'Выбран таргет';

  it('set correct target', async () => {
    const user = new User();

    await user.enter();
    await user.say('установи таргет локалхост');

    assert.include(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'локалхост');
    assert.equal(user.body.state.application.targetName, 'локалхост');
  });

  it('set incorrect target', async () => {
    const user = new User();

    await user.enter();
    await user.say('установи таргет foo');

    assert.notInclude(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'Таргет foo не найден');
  });

});

