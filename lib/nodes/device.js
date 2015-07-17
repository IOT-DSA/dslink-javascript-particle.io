'use strict';

import { NodeUnit } from '../util';

import { each, mixin } from 'goal';
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

    this._oldFunctions = [ ...device.attributes.functions ];
    this._oldVariables = { ...device.attributes.variables };

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
      },
      signal: {
        $is: 'signal',
        $invokable: 'write'
      },
      stopSignal: {
        $is: 'stopSignal',
        $invokable: 'write'
      },
      update: {
        $is: 'update',
        $invokable: 'write'
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

  _update() {
    return new Promise((resolve, reject) => {
      this.device.getAttributes((err, data) => {
        if(err) reject(err);
        resolve(data);
      });
    }).then(() => {
        this._oldFunctions.forEach((func) => {
          if(this.device.attributes.functions.indexOf(func) < 0)
            this.provider.removeNode(join(this.path, 'functions', func));
        });

        this.device.attributes.functions.forEach((func) => {
          if(this._oldFunctions.indexOf(func) < 0) {
            this.provider.getNode(join(this.path, 'functions')).load({
              [func]: {
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
              }
            });
          }
        });

        each(this._oldVariables, (type, variable) => {
          if(!this.device.attributes.variables[variable])
            this.provider.removeNode(join(this.path, 'variables', variable));
        });

        var promises = [];
        each(this.device.attributes.variables, (type, variable) => {
          if(!this._oldVariables[variable])
            this.addValue(variable, null, { suffix: 'variables', type: type.toLowerCase() });
          promises.push(this.device.getVariable(variable)
            .then((value) => this.provider.getNode(join(this.path, 'variables', variable)).updateValue(value.result)));
        });

        this._oldFunctions = [ ...this.device.attributes.functions ];
        this._oldVariables = { ...this.device.attributes.variables };

        return Promise.all(promises);
      }).then(() => { return {}; });
  }
}
