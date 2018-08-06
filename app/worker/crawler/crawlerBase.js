import log from 'electron-log';
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "crawlerBase"; // eslint-disable-line no-unused-vars

// ----------------------------------------------------------------------------------

export class CrawlerBase {


  constructor() {
    const func = ".constructor"; // eslint-disable-line no-unused-vars

    this.data = {
      processingStopped: false,
    };

    this.objects = {
      dbWrapper: null,
      dispatcher: null,
      mediaCrawler: null,
      mediaComposer: null,
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
    const func = ".init"; // eslint-disable-line no-unused-vars

    //log.debug(`${_logKey}${func}`);

    this.objects.dbWrapper = input.dbWrapper;
    this.objects.mediaCrawler = input.mediaCrawler;
    this.objects.mediaComposer = input.mediaComposer;
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
    if (!this.data.processingStopped)
      this.stopProcessing();

    // overwrite by subclass
    return Promise.resolve();
  }

  // .....................................................

  stopProcessing() {
    this.data.processingStopped = true;
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
