import log from 'electron-log';

// ----------------------------------------------------------------------------------

const _logKey = "dbWrapper";

// ----------------------------------------------------------------------------------

export class DbWrapper {

  constructor() {

    this.data = {
      dbfile: null
    };

  }

  // ........................................................

  coupleObjects(input) {
    const func = ".init";
    log.debug(`${_logKey}${func}`);

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

  open(dbfile) {
    const func = ".open";

    const p = new Promise(function openPromise(resolve, reject) {
      log.debug(`${_logKey}${func} -`, dbfile);
      resolve();
    });

    return p;
  }

  // ........................................................

  close() {
    const func = ".close";

    const p = new Promise(function closePromise(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................


}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
