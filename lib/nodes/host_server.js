import { DS, link } from '../';
import { DeviceNode } from './device.js';
import { DeviceServer } from 'spark-protocol';

let isServerStarted = false;

export default class HostServer extends DS.SimpleNode.class {
  onInvoke(params) {
    if(isServerStarted)
      throw new Error('server is already running');
    var server = new DeviceServer({
      coreKeysDir: '~/.dslink-particleio-keys'
    });

    return server.start().then(() => {
      link.addNode('/server', {
        $is: 'server'
      });
      isServerStarted = true;
      return {};
    });
  }
}
