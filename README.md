# skill-dev-proxy
Навык для Алисы, позволяющий отлаживать другие навыки прямо на устройстве.

## Установка
Навык устанавливается в виде облачной функции на я.облаке.

1. Создайте новую облачную функцию в [я.облаке](https://console.cloud.yandex.ru) с типом `nodejs14`
2. Создайте в корне файл `package.json` со следующим содержимым:
  ```json
  {
    "name": "my-proxy",
    "version": "1.0.0",
    "private": true,
    "dependencies": {
      "skill-dev-proxy": "latest"
    }
  }
  ```
3. Создайте в корне файл `index.js` по следующему шаблону - укажите свои навыки (таргеты) для проксирования:
  ```js
  exports.handler = require('skill-dev-proxy').getHandler([
    {
      name: 'навык 1',
      url: 'https://my-webhook.ru',
    },
    {
      name: 'Локалхост',
      regexp: /(local|локал|около)\s?([hfp]ost|[хп]ост)/i,
      url: 'amqps://my-amqp-url',
    },
  ]);
  ```
4. Установите параметры функции:
  - точка входа `index.handler`
  - таймаут `5`
  - память `128`
5. Нажмите "создать версию"
6. Подключение к **Алисе**: в панели разработчика навыков заведите навык и укажите ему вебхуком созданную функцию.

## Использование
Доступные команды в проксирующем навыке:
- `"список таргетов"` - просмотр списка таргетов для проксирования
- `"установи таргет ХХХ"` - установка таргета для проксирования (`XXX` - имя навыка)
- все остальные команды проксируются в выбранный таргет

## Проксирование на localhost
Для отладки локального кода удобно проксировать запросы на localhost.
Для этого используется облачный message broker https://cloudamqp.com.
Там в бесплатном тарифе 1 000 000 сообщений в месяц, что более чем достаточно.

1. Зарегистрируйтесь на https://cloudamqp.com, создайте инстанс RabbitMQ и получите урл вида `amqps://...`
2. Добавьте этот урл в конфигурацию `index.js` как в примере выше
3. В своем проекте установите `skill-dev-proxy`
  ```
  npm i -D skill-dev-proxy
  ```
4. Заведите в проекте скрипт, который слушает AMQP и вызывает ваш навык. Пример:
  ```js
  // check.js
  const { waitMessages } = require('skill-dev-proxy');
  const { handler } = require('./skill');

  waitMessages({
    amqpUrl: 'amqps://....',
    handler,
  });
  ```
5. Запустите это скрипт `node check.js`
6. В проксирующем навыке скажите `Установи таргет локалхост`
7. Теперь все запросы в проксирующий навык будут обрабатываться локальным кодом в `./skill`

