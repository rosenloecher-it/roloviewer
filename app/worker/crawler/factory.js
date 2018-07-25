import log from 'electron-log';
import {DbWrapper} from './dbWrapper';
import {Dispatcher} from "./dispatcher";
import {MediaCrawler} from "./mediaCrawler";
import {MetaReader} from './metaReader';
import {MediaLoader} from "./mediaLoader";
import {MediaComposer} from "./mediaComposer";

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
      mediaComposer: null,
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

    return this.init();
  }

  // ........................................................

  createObjects(externalObjectsIn) {
    //log.silly(`${_logKey}.createObjects`);

    const externalObjects = externalObjectsIn || {};

    const {objects} = this;

    objects.dbWrapper = externalObjects.dbWrapper || new DbWrapper();
    objects.dispatcher = externalObjects.dispatcher || new Dispatcher();
    objects.mediaCrawler = externalObjects.mediaCrawler || new MediaCrawler();
    objects.mediaComposer = externalObjects.mediaComposer || new MediaComposer();
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
    objects.mediaComposer.coupleObjects(objects);
    objects.mediaLoader.coupleObjects(objects);
    objects.metaReader.coupleObjects(objects);
  }

  // ........................................................

  init() {
    const func = '.init';

    const {objects} = this;

    Factory.checkObjects(objects);

    /* eslint-disable arrow-body-style */

    // order crucial!
    const p = objects.mediaComposer.init().then(() => {
      return objects.dbWrapper.init();
    }).then(() => {
      return objects.metaReader.init();
    }).then(() => {
      return objects.mediaCrawler.init();
    }).then(() => {
      return objects.mediaLoader.init();
    }).then(() => {
      return objects.dispatcher.init();
    }).catch((err) => {
      log.error(`${_logKey}${func} -`, err);
      throw err;
    });

    /* eslint-enable arrow-body-style */

    return p;
  }

  // ........................................................

  shutdown() {
    const func = '.shutdown';
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
      return objects.mediaComposer.shutdown();
    }).then(() => {
      instance.objects = {};
      return Promise.resolve();
    }).catch((err) => {
      log.error(`${_logKey}${func} -`, err);
      throw err;
    });
  }

  // ........................................................

  static checkObjects(objects) {

    if (!objects.dbWrapper || !objects.dispatcher || !objects.mediaCrawler
      || !objects.mediaComposer || !objects.mediaLoader || !objects.metaReader) {
        throw new Error('undefined objects cannot be handled!');
    }
  }

  // ........................................................

  getDispatcher() {
    return this.objects.dispatcher;
  }

}

// ----------------------------------------------------------------------------------
