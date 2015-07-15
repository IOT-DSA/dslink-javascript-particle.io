import { SimpleNode } from 'dslink';
import { typeOf } from 'goal';

import { join } from 'path';

export function promiseify(cb) {
  const promise = new Promise((resolve, reject) => {
    cb((data) => {
      if(data instanceof Error || data.Error)
        reject(data);
      resolve(data);
    });
  });
}

export class SimpleActionNode extends SimpleNode.class {
  constructor(path, cb) {
    super(path);
    this.cb = cb;
  }

  onInvoke(params) {
    return this.cb(params);
  }
}

export class NodeUnit extends SimpleNode.class {
  // we're already broken the serialization system, so why enable it.
  serializable = false;

  constructor(path) {
    super(path);
  }

  addValue(name, value, opt = {}) {
    (opt.suffix ? this.getNode(opt.suffix).load : this.load.bind(this))({
      [ name ]: {
        '?value': value,
        $type: opt.type || typeOf(value)
      }
    });
  }

  addAction(name, cb) {
    const path = join(this.path, name);

    this.addChild.bind(this)(path, new SimpleActionNode(path, cb));
  }
}
