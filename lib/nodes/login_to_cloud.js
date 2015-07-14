'use strict';

import { DS, link } from '../';
import { replaceAll } from 'goal';
import { DeviceNode } from './device.js';
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

export default class LoginToCloud extends DS.SimpleNode.class {
  onInvoke(params) {
    return loginToCloud(params)
      .then((devices) => {
          link.addNode('/cloud', {
            $is: 'cloud',
            $$username: params.username,
            $$password: params.password,
            $$accessToken: params.accessToken
          });

          devices.forEach((device) => {
            let nodeName = replaceAll(device.name.toLowerCase(), ' ', '_');

            link.getNode('/cloud').addChild(nodeName, new DeviceNode(`/cloud/${nodeName}`, device));
          });
        });
  }
}
