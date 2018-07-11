import log from 'electron-log';
import {DbWrapper} from './dbWrapper';
import {Dispatcher} from "./dispatcher";
import {MediaCrawler} from "./mediaCrawler";
import {MetaReader} from './metaReader';
import {MediaLoader} from "./mediaLoader";

// ----------------------------------------------------------------------------------

const _logKey = "factory";

// ----------------------------------------------------------------------------------

export class Factory {

  constructor(storeManager) {
    const func = ".constructor"

    this.data = {
      dbWrapper: null,
      dispatcher: null,
      mediaCrawler: null,
      mediaLoader: null,
      metaReader: null,
      storeManager
    };

    if (!this.data.storeManager)
      throw new Error(`${_logKey}${func} - no storeManager!`);
  }

  // ........................................................

  loadObjects(externalObjects) {
    log.silly(`${_logKey}.loadObjects - in`);

    this.createObjects(externalObjects);
    this.coupleObjects();

    return this.initObjects();
  }

  // ........................................................

  createObjects(externalObjectsIn) {
    log.silly(`${_logKey}.createObjects`);

    const externalObjects = externalObjectsIn || {};

    const {data} = this;

    data.dbWrapper = externalObjects.dbWrapper || new DbWrapper();
    data.dispatcher = externalObjects.dispatcher || new Dispatcher();
    data.mediaCrawler = externalObjects.mediaCrawler || new MediaCrawler();
    data.mediaLoader = externalObjects.mediaLoader || new MediaLoader();
    data.metaReader = externalObjects.metaReader || new MetaReader();
  }

  // ........................................................

  coupleObjects() {
    log.silly(`${_logKey}.coupleObjects`);

    const {data} = this;

    Factory.checkObjects(data);

    // all classes use the same property names!
    data.dbWrapper.coupleObjects(data);
    data.dispatcher.coupleObjects(data);
    data.mediaCrawler.coupleObjects(data);
    data.mediaLoader.coupleObjects(data);
    data.metaReader.coupleObjects(data);
  }

  // ........................................................

  initObjects() {
    const func = ".initObjects"

    const {data} = this;

    Factory.checkObjects(data);

    /* eslint-disable arrow-body-style */

    // order crucial!
    return data.dbWrapper.init().then(() => {
      return data.metaReader.init();
    }).then(() => {
      return data.mediaCrawler.init();
    }).then(() => {
      return data.mediaLoader.init();
    }).then(() => {
      return data.dispatcher.init();
    }).then(() => {
      log.silly(`${_logKey}${func} - out`);
      return true;
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
      throw new Error(`${_logKey}${func} - exception - `, error);
    });

    /* eslint-enable arrow-body-style */

  }

  // ........................................................

  shutdownObjects() {
    const func = ".shutdownObjects"
    log.silly(`${_logKey}${func} - in`);

    const instance = this;
    const {data} = instance;

    Factory.checkObjects(data);

    // order crucial!
    return data.metaReader.shutdown().then(() => {
      return data.mediaLoader.shutdown();
    }).then(() => {
      return data.mediaCrawler.shutdown();
    }).then(() => {
      return data.dispatcher.shutdown();
    }).then(() => {
      return data.dbWrapper.shutdown();
    }).then(() => {
      instance.data = {};
      //log.silly(`${_logKey}${func} - ready`);
      return true;
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
    });
  }

  // ........................................................

  static checkObjects(data) {

    if (!data.dbWrapper || !data.dispatcher || !data.mediaCrawler
      || !data.mediaLoader || !data.metaReader) {
        throw new Error('undefined objects cannot be handled!');
    }
  }

  // ........................................................

  getDispatcher() {
    return this.data.dispatcher;
  }

}

// ----------------------------------------------------------------------------------
