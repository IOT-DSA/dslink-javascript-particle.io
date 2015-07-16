'use strict';

import { NodeUnit } from '../util';

import { each } from 'goal';
import { join } from 'path';

export default class DeviceNode extends NodeUnit {
  constructor(path, device, pollingInterval) {
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
      functions: functions,
      subscribe: {
        $is: 'subscribe',
        $invokable: 'write',
        $params: [
          {
            name: 'name',
            type: 'string'
          }
        ],
        $columns: [
          {
            name: 'data',
            type: 'dynamic'
          }
        ]
      }
    });

    each(device.attributes.variables, (type, variable) => {
      this.addValue(variable, null, { suffix: 'variables', type: type.toLowerCase() });
      device.getVariable(variable)
        .then((value) => this.provider.getNode(join(this.path, 'variables', variable)).updateValue(value.result));
    });

    if(pollingInterval > 0) {
      setInterval(() => {
        each(device.attributes.variables, (type, variable) => {
          device.getVariable(variable)
            .then((value) => this.provider.getNode(join(this.path, 'variables', variable)).updateValue(value.result));
        });
      }, pollingInterval);
    }
  }
}
