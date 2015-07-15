'use strict';

let context = require('../index.js');
import { SimpleNode } from 'dslink';

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

        devices.forEach((device) => {
          let nodeName = replaceAll(device.name.toLowerCase(), ' ', '_');

          device.functions = device.functions || [];
          device.variables = device.variables || [];

          context.link.getNode('/cloud').addChild(nodeName, new DeviceNode(`/cloud/${nodeName}`, device));
        });
      }).catch((e) => console.error(e.stack));
  }
}
