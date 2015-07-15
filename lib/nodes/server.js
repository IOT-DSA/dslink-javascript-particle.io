'use strict';

import context from '../';
import DS from 'dslink';

import { promiseify } from '../util.js'
import { DeviceNode } from './device.js';
import { join } from 'path';

class ServerDevice {
  connected = true;

  // TODO
  get functions() {
    return [];
  }

  // TODO
  get variables() {
    return [];
  }

  constructor(core) {
    this.core = core;

    this.id = new DS.Path(this.path).name;
    this.version = core.product_firmware_version;
  }

  callFunction(name, params) {
    return this.core.callFunction(name, params);
  }

  signal() {
    return this.core.raiseYourHand(true);
  }

  stopSignal() {
    return this.core.raiseYourHand(false);
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

    server.on('core', (id, deleted) => {
      const absolute = `/server/${id}`;
      if(deleted) {
        context.link.getNode(absolute).device.connected = false;
        return;
      }

      if(context.link.getNode(absolute)) {
        context.link.getNode(absolute).device.connected = true;
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
