import log from 'electron-log';

// ----------------------------------------------------------------------------------

const _logKey = "mediaCrawler";

// ----------------------------------------------------------------------------------

export class MediaCrawler {

  constructor() {

    this.data = {
      dbWrapper: null
    };


  }

  // ........................................................

  static createDefaultData() {
    return {
      dbWrapper: null
    };
  }

  // ........................................................

  coupleObjects(input) {
    log.silly(`${_logKey}.coupleObjects`);

    this.data.dbWrapper = input.dbWrapper;
    this.data.storeManager = input.storeManager;

    if (!this.data.storeManager)
      throw new Error(`${_logKey}.coupleObjects - no storeManager!`);
  }

  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function initPromise(resolve, reject) {
      log.silly(`${_logKey}${func}`);
      resolve();
      //reject("dummy");
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
      throw new Error(`${_logKey}${func} - exception - `, error);
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function shutdownPromise(resolve, reject) {
      log.silly(`${_logKey}${func}`);
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



