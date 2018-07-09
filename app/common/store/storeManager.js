import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "storeManager";

// ----------------------------------------------------------------------------------

export class StoreManager {

  constructor(name, targets) {

    this._logKey = `${_logKey}(${name})`;
    this._name = name;
    this._sender = null;
    this._store = null;
    this._targets = targets;


    this.dispatchLocal = this.dispatchLocal.bind(this);
    this.dispatchGlobal = this.dispatchGlobal.bind(this);
  }

  // .....................................................

  get state() {
    // has to be overridden
    return {};
  }

  // .....................................................

  get store() { return this._store; } // has to be set by sub classes

  // .....................................................

  get sender() { return this._sender; }
  set sender(value){ this._sender = value; }

  // .....................................................

  dispatchLocal(action) {
    const func = ".dispatchLocal";

    if (!action)
      return;

    try {
      if (this._store)
        this._store.dispatch(action);
    } catch (err) {
      log.error(`${this.logKey}${func} - exception -`, err);
      log.debug(`${this.logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  dispatchRemote(action, destinations) {
    const func = ".dispatchRemote";

    if (!action || !destinations)
      return;

    try {
      if (this._sender) {
        for (let i = 0; i < destinations.length; i++) {
          this._sender.send(destinations[i], constants.AI_SPREAD_REDUX_ACTION, action);
        }
      }
    } catch (err) {
      log.error(`${this.logKey}${func} - exception -`, err);
      log.debug(`${this.logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  dispatchGlobal(action) {
    const func = ".dispatchGlobal";

    if (!action)
      return;

    try {
      this.dispatchLocal(action);
      this.dispatchRemote(action, this._targets);

    } catch (err) {
      log.error(`${this.logKey}${func} - exception -`, err);
      throw (err);
    }
  }

  // ........................................................
  // context

  get isDevelopment() {
    const {context} = this.state;
    if (!context)
      return false;
    return context.isDevelopment;
  }

  get isProduction() {
    const {context} = this.state;
    if (!context)
      return false;
    return context.isProduction;
  }

  get isTest() {
    const {context} = this.state;
    if (!context)
      return false;
    return context.isTest;
  }

  get isDevTool() {
    const {context} = this.state;
    if (!context)
      return false;
    return context.isDevTool;
  }

  get defaultConfigFile() {
    const {context} = this.state;
    if (!context)
      return null;
    return context.defaultConfigFile;
  }

  get configFile() {
    const {context} = this.state;
    if (!context)
      return null;
    return context.configFile;
  }

  // ........................................................
  // lastItems

  // get lastAutoPlay() {
  //   const {slideshowLast} = this.state;
  //   if (!slideshowLast)
  //     return false;
  //   return slideshowLast.autoPlay;
  // }
  //
  //
  // get lastContainer() { return this.data.lastItems.container; }
  //
  // get lastItem() {
  //   if (!this.data.lastItems.files)
  //     return null;
  //   const {files} = this.data.lastItems;
  //   if (files.length <= 0)
  //     return;
  //   return files[files.length - 1];
  // }
  //
  // setLastItemAndContainer(lastItemFile, lastContainer) {
  //
  //   const {lastItems} = this.data;
  //
  //   if (typeof(lastContainer) === typeof("str")) {
  //     lastItems.files = [lastItemFile];
  //   } else {
  //     if (!lastItems.files)
  //       lastItems.files = [lastItemFile];
  //     else {
  //       lastItems.files.push(lastItemFile);
  //       while (lastItems.files.length > constants.DEFCONF_CRAWLER_BATCHCOUNT)
  //         lastItems.files.shift();
  //     }
  //   }
  //   lastItems.container = lastContainer;
  // }
  //
  // // ........................................................
  // // slideshow
  //
  // get slideshowTimer() { return this.data.slideshow.timer; }
  // set slideshowTimer(value){ this.data.slideshow.timer = value; }
  //
  // get slideshowTransitionTimeAutoPlay() { return this.data.slideshow.transitionTimeAutoPlay; }
  // set slideshowTransitionTimeAutoPlay(value){ this.data.slideshow.transitionTimeAutoPlay = value; }
  //
  // get slideshowTransitionTimeManual() { return this.data.slideshow.transitionTimeManual; }
  // set slideshowTransitionTimeManual(value){ this.data.slideshow.transitionTimeManual = value; }
  //
  // get slideshowJumpWidth() { return (this.data.slideshow.jumpWidth || constants.DEFCONF_CRAWLER_BATCHCOUNT); }
  // set slideshowJumpWidth(value){ this.data.slideshow.jumpWidth = value; }
  //
  // // ........................................................
  // // crawler
  //
  // get crawlerDatabase() { return this.data.crawler.database; }
  // set crawlerDatabase(value){ this.data.crawler.database = value; }
  //
  // get crawlerBatchCount() { return (this.data.crawler.batchCount || constants.DEFCONF_CRAWLER_BATCHCOUNT); }
  // set crawlerBatchCount(value){ this.data.crawler.batchCount = value; }
  //
  // get crawlerFolderSource() { return this.data.crawler.folderSource; }
  // set crawlerFolderSource(value) { this.data.crawler.folderSource = value; }
  //
  // get crawlerFolderBlacklist() { return this.data.crawler.folderBlacklist || []; }
  // set crawlerFolderBlacklist(value){ this.data.crawler.folderBlacklist = value; }
  //
  // get crawlerFolderBlacklistSnippets() { return (this.data.crawler.folderBlacklistSnippets || []); }
  // set crawlerFolderBlacklistSnippets(value){ this.data.crawler.folderBlacklistSnippets = value; }

  // ........................................................
  // system

  get exiftoolPath() {
    const {system} = this.state;
    if (!system)
      return null;
    return system.exiftool;
  }

  get powerSaveBlockTime() {
    const {system} = this.state;
    if (!system)
      return constants.DEFCONF_POWER_SAVE_BLOCK_TIME;
    return system.powerSaveBlockTime;
  }

  // ........................................................
}
