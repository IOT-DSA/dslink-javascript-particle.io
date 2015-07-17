import { LinkProvider, SimpleActionNode, AsyncTableResult } from 'dslink';

import LoginToCloud from './nodes/login_to_cloud.js';
import HostServer from './nodes/host_server.js';
import ServerNode from './nodes/server.js';

const link = new LinkProvider(process.argv.slice(2), 'particleio-', {
  defaultNodes: {
    loginToCloud: {
      $is: 'loginToCloud',
      $invokable: 'write',
      $params: [
        {
          name: 'username',
          type: 'string'
        }, {
          name: 'password',
          type: 'string',
          editor: 'password'
        }, {
          name: 'valuePollingInterval',
          type: 'int',
          default: 0
        }
      ]
    },
    loginToCloudWithToken: {
      $is: 'loginToCloud',
      $invokable: 'write',
      $params: [
        {
          name: 'accessToken',
          type: 'string',
          editor: 'password'
        }, {
          name: 'valuePollingInterval',
          type: 'int',
          default: 0
        }
      ]
    },
    hostServer: {
      $is: 'hostServer',
      $invokable: 'write'
    }
  },
  profiles: {
    loginToCloud(path) { return new LoginToCloud(path); },
    hostServer(path) { return new HostServer(path); },
    server(path) { return new ServerNode(path); },
    // device actions
    callFunction(path) {
      return new SimpleActionNode(path, (node, params) => {
        const parent = link.getNode(node.path.split('/').slice(0, -2).join('/'));
        return parent.device.callFunction(node.name, params.param)
          .then((data) => {
            return { data };
          }).catch((e) => {
            console.error(e.stack);
          });
      });
    },
    subscribe(path) {
      return new SimpleActionNode(path, (node, params) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        const result = new AsyncTableResult();

        parent.device.subscribe(params.name, (data) => {
          result.update([
            {
              data: data
            }
          ]);
        });

        return result;
      });
    },
    signal(path) {
      return new SimpleActionNode(path, (node, params) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        return parent.device.signal();
      });
    },
    stopSignal(path) {
      return new SimpleActionNode(path, (node, params) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        return parent.device.stopSignal();
      });
    },
    update(path) {
      return new SimpleActionNode(path, (node, params) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        return parent._update();
      });
    }
  }
});

export { link };

link.connect();
