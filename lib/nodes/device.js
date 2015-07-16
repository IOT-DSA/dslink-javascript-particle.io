'use strict';

import context from '../';
import { SimpleNode, SimpleActionNode } from 'dslink';

import { each } from 'goal';
import { join } from 'path';

import { typeOf } from 'goal';

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

  addAction(name, cb) {
    const path = join(this.path, name);

    this.addChild.bind(this)(path, new SimpleActionNode(path, cb));
  }
}

export default class DeviceNode extends NodeUnit {
  constructor(path, device) {
    super(path);

    this.device = device;
    this.configs = {
      $name: device.name,
      ...this.configs
    };

    this.addValue('connected', device.attributes.connected);
    this.addValue('id', device.attributes.id);

    this.addAction('signal', () => {
      return this.device.signal();
    });

    this.addAction('stopSignal', () => {
      return this.device.stopSignal();
    });

    var functions = {};

    device.attributes.functions.forEach((func) => {
      functions[func] = {
        $is: 'callFunction',
        $invokable: 'write',
        $params: [
          {
            name: 'param',
            type: 'string'
          }
        ],
        $columns: [
          {
            name: 'data',
            type: 'int'
          }
        ]
      };
    });

    this.load({
      variables: {},
      functions: functions
    });

    each(device.attributes.variables, (type, variable) => {
      this.addValue(variable, null, { suffix: 'variables', type: type.toLowerCase() });
      device.getVariable(variable)
        .then((value) => this.provider.getNode(join(this.path, 'variables', variable)).updateValue(value.result));
    });
  }
}
