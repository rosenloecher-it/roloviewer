import log from 'electron-log';
import deepmerge from 'deepmerge';

// ----------------------------------------------------------------------------------

const logKey = "workerConfig";

// ----------------------------------------------------------------------------------

export class ConfigWorker {

  constructor() {

    this.data = ConfigWorker.createDefaultData();

  }

  // ........................................................

  static createDefaultData() {
    const data = {
      context: {},
      crawler: {},
      system: {}
    };

    return data;
  }

  // ........................................................

  importData(dataUpdate) {

    if (dataUpdate.context)
      this.data.context = deepmerge.all([ dataUpdate.context, {} ]);

    if (dataUpdate.system)
      this.data.system = deepmerge.all([ dataUpdate.system, {} ]);

    if (dataUpdate.crawler)
      this.data.crawler = deepmerge.all([ dataUpdate.crawler, {} ]);

  }

  // ........................................................

  isDevelopment() { return this.data.context.isDevelopment; }
  isProduction() { return this.data.context.isProduction; }
  isTest() { return this.data.context.isTest; }
  showDevTools() { return this.data.context.showDevTools; }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const instanceConfigWorker = new ConfigWorker();

export default instanceConfigWorker;
