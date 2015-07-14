'use strict';

import { DS, link, promiseify } from '../';
import { DeviceNode } from './device.js';
import { join } from 'path';

class ServerDevice {
  connected = true;

  // TODO
  get functions {
    return [];
  }

  // TODO
  get variables {
    return [];
  }

  constructor(core) {
    this.core = core;

    this.id = new DS.Path(this.path).name;
    this.version = core.product_firmware_version;
  }

  callFunction(name, params) {
    return promiseify((_) => {
      this.core.callFunction(name, params, _);
    });
  }

  signal() {
    return promiseify((_) => this.core.raiseYourHand(true, _));
  }

  stopSignal() {
    return promiseify((_) => this.core.raiseYourHand(false, _));
  }

  getVariable(variable) {
    return new Promise((resolve, reject) => {
      this.core.getVariable(variable, null, (value, buf, e) => {
        if(e) reject(e);
        resolve(value);
      });
    });
  }
}

export default class ServerNode extends DS.SimpleNode.class {
  constructor(path, server) {
    super(path);

    // TODO: The spark-protocol doesn't actually support this, yet
    // PR inbound
    server.on('core', (id, deleted) => {
      const absolute = `/server/${id}`;
      if(deleted) {
        link.getNode(absolute).device.connected = false;
        return;
      }

      if(link.getNode(absolute)) {
        link.getNode(absolute).device.connected = true;
        return;
      }

      const device = new ServerDevice(server.getCore(id));
      this.addNode(id, new DeviceNode(absolute, device));
    });

    this.server = server;
  }

  onInvoke(params) {

  }
}
