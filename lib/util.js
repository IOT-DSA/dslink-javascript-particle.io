'use strict';

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
    this.provider.nodes = {
      [this.path]: this,
      ...this.provider.nodes
    };
  }

  addValue(name, value, opt = {}) {
    let node = opt.suffix ? this.provider.getNode(join(this.path, opt.suffix)) : this;

    node.load.bind(node)({
      [ name ]: {
        '?value': value,
        $type: opt.type || typeOf(value)
      }
    });
  }
}
