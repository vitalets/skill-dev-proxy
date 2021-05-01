describe('SetTarget', () => {

  const SET_TARGET_KEYWORD = 'Выбран таргет';

  it('set correct target', async () => {
    const user = new User();

    await user.say('установи таргет локалхост');

    assert.include(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'Локалхост');
    assert.equal(user.state.application.targetName, 'Локалхост');
  });

  it('set correct target (by target match prop)', async () => {
    const user = new User();

    await user.say('установи target local host');

    assert.include(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'Локалхост');
    assert.equal(user.state.application.targetName, 'Локалхост');
  });

  it('set incorrect target', async () => {
    const user = new User();

    await user.say('установи таргет foo');

    assert.notInclude(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'Таргет foo не найден');
  });

});

