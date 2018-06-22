import log from 'electron-log';
import configDefault from "./workerConfig";
import {DbWrapper} from './dbWrapper';
import {Dispatcher} from "./dispatcher";
import {MediaCrawler} from "./mediaCrawler";
import {MetaReader} from './metaReader';
import {ProcessConnector} from "./processConnector";
import {TaskManager} from "./taskManager";
import {MediaLoader} from "./mediaLoader";

// ----------------------------------------------------------------------------------

const _logKey = "workerFactory";

// ----------------------------------------------------------------------------------

export class WorkerFactory {

  constructor() {

    this.data = WorkerFactory.createDefaultData();

    this.loadObjects = this.loadObjects.bind(this);
    this.createObjects = this.createObjects.bind(this);
    this.coupleObjects = this.coupleObjects.bind(this);
    this.initObjects = this.initObjects.bind(this);
    this.shutdownObjects = this.shutdownObjects.bind(this);
  }

  // ........................................................

  static createDefaultData() {
    return {
      config: null,
      dbWrapper: null,
      dispatcher: null,
      mediaCrawler: null,
      mediaLoader: null,
      metaReader: null,
      processConnector: null,
      taskManager: null
    };
  }

  // ........................................................

  loadObjects(externalObjects) {
    log.debug(`${_logKey}.loadObjects - in`);

    this.createObjects(externalObjects);
    this.coupleObjects();

    return this.initObjects();
  }

  // ........................................................

  createObjects(externalObjectsIn) {
    log.debug(`${_logKey}.createObjects`);

    const externalObjects = externalObjectsIn || {};

    const {data} = this;

    data.config = configDefault;

    data.dbWrapper = externalObjects.dbWrapper || new DbWrapper();
    data.dispatcher = externalObjects.dispatcher || new Dispatcher();
    data.mediaCrawler = externalObjects.mediaCrawler || new MediaCrawler();
    data.mediaLoader = externalObjects.mediaLoader || new MediaLoader();
    data.metaReader = externalObjects.metaReader || new MetaReader();
    data.processConnector = externalObjects.processConnector || new ProcessConnector();
    data.taskManager = externalObjects.taskManager || new TaskManager();
  }

  // ........................................................

  coupleObjects() {
    log.debug(`${_logKey}.coupleObjects`);

    const {data} = this;

    WorkerFactory.checkObjects(data);

    // all classes use the same property names!
    data.dbWrapper.coupleObjects(data);
    data.dispatcher.coupleObjects(data);
    data.mediaCrawler.coupleObjects(data);
    data.mediaLoader.coupleObjects(data);
    data.metaReader.coupleObjects(data);
    data.processConnector.coupleObjects(data);
    data.taskManager.coupleObjects(data);

  }

  // ........................................................

  initObjects() {
    const func = ".initObjects"
    log.debug(`${_logKey}${func} - in`);

    const {data} = this;

    WorkerFactory.checkObjects(data);

    // order crucial!
    return data.dbWrapper.init().then(() => {
      return data.taskManager.init();
    }).then(() => {
      return data.metaReader.init();
    }).then(() => {
      return data.mediaCrawler.init();
    }).then(() => {
      return data.mediaLoader.init();
    }).then(() => {
      return data.processConnector.init();
    }).then(() => {
      return data.dispatcher.init();
    }).then(() => {
      log.debug(`${_logKey}${func} - out`);
      return true;
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
      throw new Error(`${_logKey}${func} - exception - `, error);
    });

  }

  // ........................................................

  shutdownObjects() {
    const func = ".shutdownObjects"
    log.debug(`${_logKey}${func} - in`);

    const instance = this;
    const {data} = instance;

    WorkerFactory.checkObjects(data);

    // order crucial!
    return data.taskManager.shutdown().then(() => {
      return data.processConnector.shutdown();
    }).then(() => {
      return data.metaReader.shutdown();
    }).then(() => {
      return data.mediaLoader.shutdown();
    }).then(() => {
      return data.mediaCrawler.shutdown();
    }).then(() => {
      return data.dispatcher.shutdown();
    }).then(() => {
      return data.dbWrapper.shutdown();
    }).then(() => {
      instance.data = WorkerFactory.createDefaultData();
      log.debug(`${_logKey}${func} - out`);
      return true;
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
      throw new Error(`${_logKey}${func} - exception - `, error);
    });
  }

  // ........................................................

  static checkObjects(data) {

    if (!data.dbWrapper || !data.dispatcher || !data.mediaCrawler || !data.mediaLoader
      || !data.metaReader || !data.processConnector || !data.taskManager) {
        throw new Error('undefined objects cannot be handled!');
    }
  }

  // ........................................................

  getDispatcher() {
    return this.data.dispatcher;
  }

}

// ----------------------------------------------------------------------------------
