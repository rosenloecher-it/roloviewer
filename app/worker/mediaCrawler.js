import log from 'electron-log';

// ----------------------------------------------------------------------------------

const _logKey = "mediaCrawler";

// ----------------------------------------------------------------------------------

export class MediaCrawler {

  constructor() {

    this.data = MediaCrawler.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);
  }

  // ........................................................

  static createDefaultData() {
    return {
      dbWrapper: null
    };
  }

  // ........................................................

  coupleObjects({dbWrapper}) {
    log.debug(`${_logKey}.coupleObjects`);

    this.data.dbWrapper = dbWrapper;
  }

  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
      //reject("dummy");
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
      throw new Error(`${_logKey}${func} - exception - `, error);
    });

    return p;

    // return dummy promise
    return new Promise(function(resolve) { resolve(); });
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  startNew() {

  }

  // ........................................................

  updateFile(file) {

  }

  // .......................................................

  evalFolder(folder) {

  }

  // .......................................................

  updateFolder(folder) {

  }

  // .......................................................



}

// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------



