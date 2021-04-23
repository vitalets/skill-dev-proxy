# skill-dev-proxy
Навык "Инструменты разработчика".
Позволяет проксировать запросы на урлы других навыков, а также на localhost через Message Queue.

## Установка

1. Создайте новую облачную функцию в [я.облаке](https://console.cloud.yandex.ru) с типом `nodejs14`
1. Создайте в корне файл `index.js` и cкопируйте в него содержимое `dist/index.js`
2. Создайте в корне файл `package.json` и cкопируйте в него содержимое `dist/package.json`
3. Создайте в корне файл `targets.js`, cкопируйте в него содержимое `dist/targets.js` и **внесите туда свои таргеты для проксирования**
4. Установите параметры функции:
  - точка входа `index.handler`
  - таймаут `3`
  - память `128`
5. Если хотите проксировать на localhost через Message Queue, то подключите сервисный аккаунт и установите статические ключи в следующие переменные окружения:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`

6. Подключение к **Алисе**: в панели разработчика навыков заведите вспомогательный навык и укажите ему вебхуком созданную функцию.
7. Подключение к **Сберу**: tbd

## Использование
Доступные команды в навыке:
- `"список таргетов"` - просмотр списка таргетов для проксирования
- `"установи таргет ХХХ"` - установка таргета для проксирования
- все остальные команды проксируются в выбранный таргет

