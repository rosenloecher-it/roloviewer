import log from 'electron-log';
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "crawlerBase";

// ----------------------------------------------------------------------------------

export class CrawlerBase {


  constructor() {
    const func = ".constructor";

    this.data = {};

    this.objects = {
      dbWrapper: null,
      dispatcher: null,
      mediaCrawler: null,
      mediaDisposer: null,
      mediaLoader: null,
      metaReader: null,
      storeManager: null
    };

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.logAndShowError = this.logAndShowError.bind(this);
    this.logAndRethrowError = this.logAndRethrowError.bind(this);
    this.shutdown = this.shutdown.bind(this);

  }

  // ........................................................

  coupleObjects(input) {
    const func = ".init";
    //log.debug(`${_logKey}${func}`);

    this.objects.dbWrapper = input.dbWrapper;
    this.objects.mediaCrawler = input.mediaCrawler;
    this.objects.mediaDisposer = input.mediaDisposer;
    this.objects.mediaLoader = input.mediaLoader;
    this.objects.metaReader = input.metaReader;
    this.objects.storeManager = input.storeManager;

  }

  // ........................................................

  init() {
    // overwrite by subclass
    return Promise.resolve();
  }

  // ........................................................

  shutdown() {
    // overwrite by subclass
    return Promise.resolve();
  }

  // ........................................................

  logAndShowError(logPos, err) {
    log.error(`${logPos} -`, err);
    if (this.objects.storeManager)
      this.objects.storeManager.showMessage(constants.MSG_TYPE_ERROR, `${logPos} - ${err}`)
  }

  // ........................................................

  logAndRethrowError(logPos, err) {
    log.error(`${logPos} -`, err);
    throw err; // stacktrace of errors is not useable anyway
  }

  // ........................................................

}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
