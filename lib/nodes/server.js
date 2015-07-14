import { DS } from '../';

export default class ServerNode extends DS.SimpleNode.class {
  constructor(path, server) {
    super(path);

    this.server = server;
  }

  onInvoke(params) {

  }
}
