describe('SetTarget', () => {

  const SET_TARGET_KEYWORD = 'Выбран таргет';

  it('set correct target', async () => {
    const inputs = [
      'установи таргет Локалхост',
      'поставь target локал хост',
      'установи таргет localhost',
      'установить таргет local host',
      'установить таргет около host',
      'алиса установи таргет около host',
    ];
    const user = new User();
    for (const input of inputs) {
      await user.say(input);
      assert.include(user.response.text, SET_TARGET_KEYWORD, input);
      assert.include(user.response.text, 'Локалхост', input);
      assert.equal(user.state.application.targetName, 'Локалхост', input);
    }
  });

  it('set incorrect target', async () => {
    const user = new User();

    await user.say('установи таргет foo');

    assert.notInclude(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'Таргет foo не найден');
  });

});

