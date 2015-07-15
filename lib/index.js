import DS from 'dslink';

import LoginToCloud from './nodes/login_to_cloud.js';
import HostServer from './nodes/host_server.js';
import ServerNode from './nodes/server.js';

const { LinkProvider, SimpleActionNode } = DS;

const link = new LinkProvider(process.argv.slice(2), 'particleio-', {
  defaultNodes: {
    loginToCloud: {
      $is: 'loginToCloud',
      $invokable: 'write',
      $params: [
        {
          name: 'username',
          type: 'string'
        },
        {
          name: 'password',
          type: 'string',
          editor: 'password'
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
        }
      ]
    },
    hostServer: {
      $is: 'hostServer'
    }
  },
  profiles: {
    loginToCloud(path) { return new LoginToCloud(path); },
    hostServer(path) { return new HostServer(path); },
    server(path) { return new ServerNode(path); },
    // device actions
    callFunction(path) {
      return new SimpleActionNode(path, (params) => {
        return this.parent.device.callFunction(this.name, params.args)
          .then((data) => {
            return { data };
          });
      });
    }
  }
});

export { link };

link.connect();
