import { SimpleNode, SimpleActionNode } from 'dslink';
import { typeOf } from 'goal';

import { join } from 'path';

export function sanitize(obj, ...props) {
  const returned = Object.assign({}, obj);
  props.forEach((prop) => {
    if(returned.hasOwnProperty(prop))
      delete returned[prop];
  });
  return returned;
}

class NodeUnit extends SimpleNode.class {
  // we're already broken the serialization system, so why enable it.
  serializable = false;

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
