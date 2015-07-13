import { LinkProvider } from 'dslink';
import LoginToCloud from './nodes/login_to_cloud.js';
import CloudNode from './nodes/cloud.js';

const link = new LinkProvider(process.argv.slice(2), 'particleio-', {
  defaultNodes: {

  },
  profiles: {
    loginToCloud(path) => new LoginToCloud(path),
    cloud(path) => new Cloud(path)
  }
});

export * from './util.js';
export DS from 'dslink';

export link;

link.connect();
