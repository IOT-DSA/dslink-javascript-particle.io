import { LinkProvider, SimpleActionNode } from 'dslink';
import LoginToCloud from './nodes/login_to_cloud.js';
import CloudNode from './nodes/cloud.js';

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
    }
  },
  profiles: {
    loginToCloud(path) => new LoginToCloud(path),
    cloud(path) => new CloudNode(path),
    // device actions
    callFunction(path) => {
      return new SimpleActionNode(path, (params) => {
        return this.parent.device.callFunction.apply(this.parent.device, [this.name, ...params.args])
          .then((data) => {
            return {
              data
            };
          });
      });
    }
  }
});

export * from './util.js';
export DS from 'dslink';

export link;

link.connect();
