'use strict';

import { NodeUnit } from '../';

export default class DeviceNode extends NodeUnit {
  constructor(path, device) {
    super(path);

    this.device = device;
    this.configs = {
      $name: device.name,
      ...this.configs
    };

    this.addValue('connected', device.connected);
    this.addValue('version', device.version);
    this.addValue('id', device.id);

    this.addAction('signal', () => {
      return this.device.signal();
    });

    this.addAction('stopSignal', () => {
      return this.device.stopSignal();
    });

    var functions = device.functions.map((func) => {
      return {
        [ func ]: {
          $is: 'callFunction',
          $params: [
            {
              name: 'args',
              type: 'array'
            }
          ],
          $columns: [
            {
              name: 'data',
              type: 'dynamic'
            }
          ]
        }
      };
    });

    this.load({
      variables: {
        $name: 'Variables'
      },
      functions: Object.assign.apply(null, [{
        $name: 'Functions'
      }, ...functions])
    });

    device.variables.forEach((variable) => {
        this.addValue(variable, null, { type: 'dynamic' });
        device.getVariable(variable)
            .then((value) => this.getNode(variable).updateValue(value));
      });
  }
}
