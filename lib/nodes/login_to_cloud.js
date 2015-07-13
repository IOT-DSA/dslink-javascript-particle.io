import { DS, link, sanitize } from '../';
import { replaceAll } from 'goal';
import { DeviceNode } from './device.js';
import spark from 'spark';

let hasLoggedIn = false;

// duck typed with the Device class
class CloudDevice {
  constructor(device) {
    this.device = device;
  }
}

loginToCloud(params) {
  // TODO: Multiple cloud account support
  if(hasLoggedIn)
    throw new Error('already logged into cloud');

  return spark.login(params)
    .then(() => spark.listDevices())
    .then((devices) => {
        hasLoggedIn = true;
        return devices.map((device) => new CloudDevice(device));
      });
}

export default class LoginToCloud extends DS.SimpleNode.class {
  onInvoke(params) {
    return loginToCloud(sanitize(params, 'name'))
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
