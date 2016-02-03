import { LinkProvider, SimpleActionNode, AsyncTableResult } from 'dslink/debug';

import LoginToCloud from './nodes/login_to_cloud.js';
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
    }
  },
  profiles: {
    loginToCloud(path, provider) { return new LoginToCloud(path, provider); },
    server(path, provider) { return new ServerNode(path, provider); },
    // device actions
    callFunction(path, provider) {
      return new SimpleActionNode(path, provider, (params, node) => {
        const parent = link.getNode(node.path.split('/').slice(0, -2).join('/'));
        return parent.device.callFunction(node.name, params.param)
          .then((data) => {
            return { data };
          }).catch((e) => {
            console.error(e.stack);
          });
      });
    },
    subscribe(path, provider) {
      return new SimpleActionNode(path, provider, (params, node) => {
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
    signal(path, provider) {
      return new SimpleActionNode(path, provider, (params, node) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        return parent.device.signal().then(() => { return {}; });
      });
    },
    stopSignal(path, provider) {
      return new SimpleActionNode(path, provider, (params, node) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        return parent.device.stopSignal().then(() => { return {}; });
      });
    },
    update(path, provider) {
      return new SimpleActionNode(path, provider, (params, node) => {
        const parent = link.getNode(node.path.split('/').slice(0, -1).join('/'));
        return parent._update();
      });
    }
  }
});

export { link };

link.connect();
