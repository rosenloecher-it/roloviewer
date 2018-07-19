import log from 'electron-log';
import {DbWrapper} from './dbWrapper';
import {Dispatcher} from "./dispatcher";
import {MediaCrawler} from "./mediaCrawler";
import {MetaReader} from './metaReader';
import {MediaLoader} from "./mediaLoader";
import {MediaDisposer} from "./mediaDisposer";

// ----------------------------------------------------------------------------------

const _logKey = "factory";

// ----------------------------------------------------------------------------------

export class Factory {

  constructor(storeManager) {
    const func = '.constructor';

    this.objects = {
      dbWrapper: null,
      dispatcher: null,
      mediaCrawler: null,
      mediaDisposer: null,
      mediaLoader: null,
      metaReader: null,
      storeManager
    };

    if (!this.objects.storeManager)
      throw new Error(`${_logKey}${func} - no storeManager!`);
  }

  // ........................................................

  loadObjects(externalObjects) {
    //log.silly(`${_logKey}.loadObjects - in`);

    this.createObjects(externalObjects);
    this.coupleObjects();

    return this.initObjects();
  }

  // ........................................................

  createObjects(externalObjectsIn) {
    //log.silly(`${_logKey}.createObjects`);

    const externalObjects = externalObjectsIn || {};

    const {objects} = this;

    objects.dbWrapper = externalObjects.dbWrapper || new DbWrapper();
    objects.dispatcher = externalObjects.dispatcher || new Dispatcher();
    objects.mediaCrawler = externalObjects.mediaCrawler || new MediaCrawler();
    objects.mediaDisposer = externalObjects.mediaDisposer || new MediaDisposer();
    objects.mediaLoader = externalObjects.mediaLoader || new MediaLoader();
    objects.metaReader = externalObjects.metaReader || new MetaReader();

  }

  // ........................................................

  coupleObjects() {
    //log.silly(`${_logKey}.coupleObjects`);

    const {objects} = this;

    Factory.checkObjects(objects);

    // all classes use the same property names!
    objects.dbWrapper.coupleObjects(objects);
    objects.dispatcher.coupleObjects(objects);
    objects.mediaCrawler.coupleObjects(objects);
    objects.mediaDisposer.coupleObjects(objects);
    objects.mediaLoader.coupleObjects(objects);
    objects.metaReader.coupleObjects(objects);
  }

  // ........................................................

  initObjects() {
    const func = '.initObjects';

    const {objects} = this;

    Factory.checkObjects(objects);

    /* eslint-disable arrow-body-style */

    // order crucial!
    return objects.mediaDisposer.init().then(() => {
      return objects.dbWrapper.init();
    }).then(() => {
      return objects.metaReader.init();
    }).then(() => {
      return objects.mediaCrawler.init();
    }).then(() => {
      return objects.mediaLoader.init();
    }).then(() => {
      return objects.dispatcher.init();
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
    const func = '.shutdownObjects';
    //log.silly(`${_logKey}${func} - in`);

    const instance = this;
    const {objects} = instance;

    Factory.checkObjects(objects);

    // order crucial!
    return objects.metaReader.shutdown().then(() => {
      return objects.mediaLoader.shutdown();
    }).then(() => {
      return objects.mediaCrawler.shutdown();
    }).then(() => {
      return objects.dispatcher.shutdown();
    }).then(() => {
      return objects.dbWrapper.shutdown();
    }).then(() => {
      return objects.mediaDisposer.shutdown();
    }).then(() => {
      instance.objects = {};
      //log.silly(`${_logKey}${func} - ready`);
      return true;
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
    });
  }

  // ........................................................

  static checkObjects(objects) {

    if (!objects.dbWrapper || !objects.dispatcher || !objects.mediaCrawler
      || !objects.mediaDisposer || !objects.mediaLoader || !objects.metaReader) {
        throw new Error('undefined objects cannot be handled!');
    }
  }

  // ........................................................

  getDispatcher() {
    return this.objects.dispatcher;
  }

}

// ----------------------------------------------------------------------------------
