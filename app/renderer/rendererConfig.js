import log from 'electron-log';
import deepmerge from 'deepmerge';

// ----------------------------------------------------------------------------------

const logKey = "config";

// ----------------------------------------------------------------------------------

export class ConfigRenderer {

  constructor() {

    this.data = ConfigRenderer.createDefaultData();

  }

  // ........................................................

  static createDefaultData() {
    const data = {
      system: {},
      slideshow: {}
    };

    return data;
  }

  // ........................................................

  importData(dataUpdate) {

    if (dataUpdate.system) {
      this.data.system = deepmerge.all([ dataUpdate.system, {} ]);
    }

    if (dataUpdate.slideshow) {
      this.data.slideshow = deepmerge.all([ dataUpdate.slideshow, {} ]);
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

const instanceConfigRenderer = new ConfigRenderer();

export default instanceConfigRenderer;
