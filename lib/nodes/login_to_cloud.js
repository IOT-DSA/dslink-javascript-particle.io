'use strict';

let context = require('../index.js');
import { SimpleNode } from 'dslink/debug';

import { replaceAll } from 'goal';
import DeviceNode from './device.js';
import spark from 'spark';

let hasLoggedIn = false;

function loginToCloud(params) {
  // TODO: Multiple cloud account support
  if(hasLoggedIn)
    throw new Error('already logged into cloud');

  return spark.login(params)
    .then(() => spark.listDevices())
    .then((devices) => {
        hasLoggedIn = true;
        return devices;
      });
}

export default class LoginToCloud extends SimpleNode.class {
  onInvoke(params) {
    return loginToCloud(params)
      .then((devices) => {
        context.link.addNode('/cloud', {
          $$username: params.username,
          $$password: params.password,
          $$accessToken: params.accessToken
        });

        return Promise.all(devices.map((device) => {
          return new Promise((resolve, reject) => {
            device.getAttributes((err, attr) => {
              if(err) reject(err);
              resolve(device);
            });
          });
        }));
      }).then((devices) => {
        devices.forEach((device) => {
          let nodeName = replaceAll(device.name.toLowerCase(), ' ', '_');
          context.link.getNode('/cloud').addChild(nodeName, new DeviceNode(`/cloud/${nodeName}`, device, parseInt(params.valuePollingInterval)));
        });
      }).catch((e) => console.error(e.stack));
  }
}
