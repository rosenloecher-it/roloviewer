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
      context: {},
      slideshow: {},
      system: {}
    };

    return data;
  }

  // ........................................................

  pushMainConfig(dataUpdate) {

    if (dataUpdate.context)
      this.data.context = deepmerge.all([ dataUpdate.context, {} ]);

    if (dataUpdate.slideshow)
      this.data.slideshow = deepmerge.all([ dataUpdate.slideshow, {} ]);

    if (dataUpdate.system)
      this.data.system = deepmerge.all([ dataUpdate.system, {} ]);
  }

  // ........................................................

  isDevelopment() { return this.data.context.isDevelopment; }
  isProduction() { return this.data.context.isProduction; }
  isTest() { return this.data.context.isTest; }
  showDevTools() { return this.data.context.showDevTools; }

  // ........................................................

  get slideshowTimer() { return this.data.slideshow.timer; }
  set slideshowTimer(value){ this.data.slideshow.timer = value;  }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const instanceConfigRenderer = new ConfigRenderer();

export default instanceConfigRenderer;
