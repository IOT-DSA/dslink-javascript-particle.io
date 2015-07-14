'use strict';

import context from '../';
import DS from 'dslink';

import { DeviceNode } from './device.js';
import { DeviceServer } from 'spark-protocol';

let isServerStarted = false;

export default class HostServer extends DS.SimpleNode.class {
  onInvoke() {
    if(isServerStarted)
      throw new Error('server is already running');

    const server = new DeviceServer({
      coreKeysDir: '~/.dslink-particleio-keys'
    });

    return server.start().then(() => {
      context.link.addNode('/server', {
        $is: 'server'
      });
      isServerStarted = true;
      return {};
    });
  }
}
