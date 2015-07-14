import DS from 'dslink';
import LoginToCloud from './nodes/login_to_cloud.js';
import HostServer from './nodes/host_server.js';
import CloudNode from './nodes/cloud.js';
import ServerNode from './nodes/server.js';

const { LinkProvider, SimpleActionNode } = DS;

const link = new LinkProvider(process.argv.slice(2), 'particleio-', {
  defaultNodes: {
    loginToCloud: {
      $is: 'loginToCloud',
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
    cloud(path) { return new CloudNode(path); },
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

export { promiseify, NodeUnit } from './util.js';
export { DS, link };

link.connect();
