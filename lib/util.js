import { SimpleNode } from 'dslink';

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
    try {
      return this.cb(this, params);
    } catch(e) {
      console.error(e.stack);
    }
    return {};
  }
}
