import log from 'electron-log';
import deepmerge from 'deepmerge';

// ----------------------------------------------------------------------------------

const logKey = "config";

// ----------------------------------------------------------------------------------

export class ConfigWorker {

  constructor() {

    this.data = ConfigWorker.createDefaultData();

  }

  // ........................................................

  static createDefaultData() {
    const data = {
      system: {},
      crawler: {},
    };

    return data;
  }

  // ........................................................

  importData(dataUpdate) {

    if (dataUpdate.system) {
      this.data.system = deepmerge.all([ dataUpdate.system, {} ]);
    }

    if (dataUpdate.crawler) {
      this.data.crawler = deepmerge.all([ dataUpdate.crawler, {} ]);
    }

  }

  // ........................................................

  isDevelopment() { return this.data.system.isDevelopment; }
  isProduction() { return this.data.system.isProduction; }
  isTest() { return this.data.system.isTest; }
  showDevTools() { return this.data.system.showDevTools; }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const instanceConfigWorker = new ConfigWorker();

export default instanceConfigWorker;
