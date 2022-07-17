/**
 * See: https://yandex.ru/dev/dialogs/smart-home/doc/reference/resources.html
 */
import express from 'express';
import { logger } from '../logger';

export const router = express.Router();

router.head('/', (req, res) => {
  res.send();
});

// https://yandex.ru/dev/dialogs/smart-home/doc/reference/get-devices.html
router.get('/user/devices', (req, res) => {
  logger.log(`getDevices request: ${JSON.stringify(req.body)}`);
  logger.log(`Authorization: ${req.get('Authorization')}`);
  const resObj = {
    request_id: req.get('X-Request-Id'),
    payload: {
      user_id: 'xxx',
      devices: [
        {
          id: 'device_1',
          name: 'Имя устройства',
          description: 'Описание устройства',
          type: 'devices.types.light',
          capabilities: [
            {
              type: 'devices.capabilities.on_off',
              retrievable: true,
              reportable: false,
            }
          ],
          device_info: {
            manufacturer: 'Manufacturer 1',
            model: 'Model 1',
          }
        }
      ]
    }

  };
  res.json(resObj);
});

router.post('/user/devices/query', (req, res) => {
  logger.log(`queryDevices request: ${JSON.stringify(req.body)}`);
  // const resObj = {
  //   request_id: req.get('X-Request-Id'),
  //   payload: {
  //     devices: [],
  //   }
  // };
  const resObj = {
    error_code: 'INTERNAL_ERROR',
    error_message: 'Описание ошибки',
  };
  res.json(resObj);
});

router.post('/user/devices/action', (req, res) => {
  logger.log(`queryDevices request: ${JSON.stringify(req.body)}`);
  // const resObj = {
  //   request_id: req.get('X-Request-Id'),
  //   payload: {
  //     devices: [],
  //   }
  // };
  const resObj = {
    error_code: 'INTERNAL_ERROR',
    error_message: 'Описание ошибки',
  };
  res.json(resObj);
});
