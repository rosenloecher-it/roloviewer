import log from 'electron-log';

// ----------------------------------------------------------------------------------

const _logKey = "crawlerBase";

// ----------------------------------------------------------------------------------

export class CrawlerBase {


  constructor() {
    const func = ".constructor"

    this.data = {
      dbWrapper: null,
      dispatcher: null,
      mediaCrawler: null,
      mediaLoader: null,
      metaReader: null,
      storeManager: null
    };
  }

  // ........................................................

  coupleObjects(input) {
    const func = ".init";
    //log.debug(`${_logKey}${func}`);

    this.data.dbWrapper = input.dbWrapper;
    this.data.mediaCrawler = input.mediaCrawler;
    this.data.mediaLoader = input.mediaLoader;
    this.data.metaReader = input.metaReader;
    this.data.storeManager = input.storeManager;

  }

  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function initPromise(resolve, reject) {
      //log.silly(`${_logKey}${func}`);
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



}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
