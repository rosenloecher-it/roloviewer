import log from 'electron-log';
import * as constants from '../constants';
import * as actionsMsg from "./messageActions";

// ----------------------------------------------------------------------------------

const _logKey = "storeManager";

// ----------------------------------------------------------------------------------

export class StoreManager {

  constructor(myself, targets) {
    const func = ".constructor";

    this._logKey = `${_logKey}(${myself})`;
    this._myself = myself;
    this._sender = null;
    this._store = null;
    this._targets = targets;
    this._processingStopped = false;

    this.dispatchLocal = this.dispatchLocal.bind(this);
    this.dispatchGlobal = this.dispatchGlobal.bind(this);
    this.dispatchRemote = this.dispatchRemote.bind(this);
    this.showMessage = this.showMessage.bind(this);
  }

  // .....................................................

  shutdown() {
    this._sender = null;
    this._store = null;
    this._targets = null;
  }

  // .....................................................

  stopProcessing() {
    this._processingStopped = true;
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

  dispatchLocal(action, invokeHook = false) {
    const func = ".dispatchLocal";

    if (!action || this._processingStopped)
      return;

    try {
      //log.debug(`${this._logKey}${func} -`, action);

      if (this._store)
        this._store.dispatch(action);

      if (invokeHook)
        this.hookActionWasDispatched(action);

    } catch (err) {
      log.error(`${this._logKey}${func} - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  dispatchLocalByRemote(action) {
    const func = '.dispatchLocalByRemote';
    try {
      return this.dispatchLocal(action, true);
    } catch (err) {
      log.error(`${this._logKey}${func} - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
    }
  }

  // .....................................................

  dispatchRemote(action, destinationsIn = null) {
    const func = ".dispatchRemote";

    let destinations = destinationsIn;
    if (destinations === null)
      destinations = this._targets;

    if (!action || !destinations || this._processingStopped)
      return;

    try {
      if (!this._sender)
        throw new Error("no sender!");

      for (let i = 0; i < destinations.length; i++) {
        this._sender.send(destinations[i], constants.AI_SPREAD_REDUX_ACTION, action);
      }

    } catch (err) {
      log.error(`${this._logKey}${func} - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  dispatchGlobal(action) {
    const func = ".dispatchGlobal";

    if (!action || this._processingStopped)
      return;

    try {

      if (this._store)
        this._store.dispatch(action);

      this.dispatchRemote(action, this._targets);

    } catch (err) {
      log.error(`${this._logKey}${func} - exception -`, err);
      throw (err);
    }
  }

  // ........................................................

  hookActionWasDispatched(action) {
    // has to be overridden by sub classes
  }

  // ........................................................

  dumpState2Log() {
    const currentState = this.state;
    log.debug(`${this._logKey}.dumpState2Log:`, currentState);
  }

  // ........................................................

  showMessage(msgType, msgText) {

    const action = actionsMsg.createActionAddMessage(msgType, msgText);

    if (this._myself === constants.IPC_RENDERER)
      this.dispatchLocal(action);
    else
      this.dispatchRemote(action, [constants.IPC_RENDERER]);
  }


  // ........................................................

  showError(msgText) {
    this.showMessage(constants.MSG_TYPE_ERROR, msgText)
  }

  // ........................................................
  // context

  get contextState() {
    return this.state.context;
  }

  get configFile() {
    return this.state.context.configFile;
  }

  get isDevelopment() {
    const {context} = this.state;
    if (!context)
      return false;
    return context.isDevelopment;
  }

  get isDevtool() {
    const {context} = this.state;
    if (!context)
      return false;
    return context.isDevtool;
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

  // ........................................................
  // crawler

  get crawlerState() {
    return this.state.crawler;
  }

  get databasePath() {
    return this.state.crawler.databasePath;
  }

  // ........................................................
  // progress

  get workerState() {
    return this.state.worker;
  }

  // ........................................................
  // mainWindow

  get mainWindowState() {
    return this.state.mainWindow;
  }

  get activeDevtool() {
    return this.state.mainWindow.activeDevtool;
  }

  // ........................................................
  // slideshow

  get slideshowState() {
    return this.state.slideshow;
  }

  get slideshowTimer() {
    return this.state.slideshow.timer;
  }

  get slideshowTransitionTimeAutoPlay() {
    return this.state.slideshow.transitionTimeAutoPlay
  }

  get slideshowTransitionTimeManual() {
    return this.state.slideshow.transitionTimeManual;
  }

  get slideshowJumpWidth() {
    return constants.DEFCONF_CRAWLER_BATCHCOUNT;
  }

  get slideshowCurrentItem() {
    const {slideshow} = this.state;
    if (!slideshow)
      return null;
    if (slideshow.itemIndex >= slideshow.items.length)
      return null;
    return slideshow.items[slideshow.itemIndex];
  }

  // ........................................................
  // system

  get systemState() {
    return this.state.system;
  }

  get exiftoolPath() {
    return this.state.system.exiftool;
  }

  get lastDialogFolder() {
    return this.state.system.lastDialogFolder;
  }

  get logConfig() {
    const {system} = this.state;
    return {
      logLevelFile: system.logLevelFile,
      logLevelConsole: system.logLevelConsole,
      logfile: system.logfile,
    }
  }

  get powerSaveBlockTime() {
    return this.state.system.powerSaveBlockTime;
  }

  get meta2MapUrlFormat() {
    return this.state.system.mapUrlFormat;
  }

}
