describe('SetTarget', () => {

  const SET_TARGET_KEYWORD = 'Выбран таргет';

  it('set correct target', async () => {
    const inputs = [
      'локалхост',
      'установи таргет Локалхост',
      'поставь target локал хост',
      'установи таргет localhost',
      'установить таргет local host',
      'установить таргет около host',
      'алиса установи таргет около host',
      'target localhost',
    ];
    const user = new User();
    for (const input of inputs) {
      await user.say(input);
      assert.include(user.response.text, SET_TARGET_KEYWORD, input);
      assert.include(user.response.text, 'Локалхост', input);
      assert.equal(user.state.application.targetName, 'Локалхост', input);
    }
  });

  it('set target by button', async () => {
    const user = new User();
    await user.say('список таргетов');
    await user.tap('Локалхост');
    assert.include(user.response.text, SET_TARGET_KEYWORD);
    assert.include(user.response.text, 'Локалхост');
    assert.equal(user.state.application.targetName, 'Локалхост');
  });

});

