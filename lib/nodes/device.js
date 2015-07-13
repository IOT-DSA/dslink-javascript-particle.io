import { DS } from '../';

export default class DeviceNode extends DS.SimpleNode.class {
  serializable = false;

  constructor(path, device) {
    super(path);

    this.device = device;
    
    this.load({

    });
  }
}
