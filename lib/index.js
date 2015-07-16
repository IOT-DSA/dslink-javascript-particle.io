import { LinkProvider, Path, SimpleActionNode } from 'dslink';

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
        return link.getNode(node.path.split('/').slice(0, -2).join('/')).device.callFunction(new Path(node.path).name, params.param)
          .then((data) => {
            return { data };
          }).catch((e) => {
            console.error(e.stack);
          });
      });
    }
  }
});

export { link };

link.connect();
