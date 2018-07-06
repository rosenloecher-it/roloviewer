import log from 'electron-log';
import { ConfigBase } from '../common/configBase';

// ----------------------------------------------------------------------------------

export class ConfigWorker extends ConfigBase {

  constructor() {
    super();

  }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const _instance = new ConfigWorker();

export default _instance;
