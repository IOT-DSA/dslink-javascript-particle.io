import { SimpleNode, SimpleActionNode } from 'dslink';
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

export class NodeUnit extends SimpleNode.class {
  // we're already broken the serialization system, so why enable it.
  serializable = false;

  constructor(path) {
    super(path);
  }

  addValue(name, value, opt) {
    (opt.suffix ? this.getNode(opt.suffix).load : this.load)({
      [ name ]: {
        '?value': value,
        $type: opt.type || typeOf(value)
      }
    });
  }

  addAction(name, cb, suffix) {
    let basePath = this.path;
    if(suffix)
      basePath = join(basePath, suffix);
    const path = join(basePath, name);

    (suffix ? this.getNode(suffix).addChild : this.addChild)
        (path, new SimpleActionNode(path, cb));
  }
}
