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

    if (!action)
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
    return this.dispatchLocal(action, true);
  }

  // .....................................................

  dispatchRemote(action, destinationsIn = null) {
    const func = ".dispatchRemote";

    let destinations = destinationsIn;
    if (destinations === null)
      destinations = this._targets;

    if (!action || !destinations)
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

    if (!action)
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
    const {context} = this.state;
    if (!context)
      return {};
    return context;
  }

  get configFile() {
    const {context} = this.state;
    if (!context)
      return null;
    return context.configFile;
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
    const {crawler} = this.state;
    if (!crawler)
      return {};
    return crawler;
  }

  get database() {
    const {crawler} = this.state;
    if (!crawler)
      return {};
    return crawler.database;
  }

  // ........................................................
  // crawlerTasks

  get crawlerTasksState() {
    const {crawlerTasks} = this.state;
    if (!crawlerTasks)
      return {};
    return crawlerTasks;
  }



  // ........................................................
  // mainWindow

  get mainWindowState() {
    const {mainWindow} = this.state;
    if (!mainWindow)
      return {};
    return mainWindow;
  }

  get activeDevtool() {
    const {mainWindow} = this.state;
    if (!mainWindow)
      return false;
    return mainWindow.activeDevtool;
  }

  // ........................................................
  // slideshow

  get slideshowState() {
    const {slideshow} = this.state;
    if (!slideshow)
      return {};
    return slideshow;
  }

  get slideshowTimer() {
    const {slideshow} = this.state;
    if (!slideshow)
      return constants.DEFCONF_TIMER;
    return slideshow.timer || constants.DEFCONF_TIMER;
  }

  get slideshowTransitionTimeAutoPlay() {
    const {slideshow} = this.state;
    if (!slideshow)
      return constants.DEFCONF_TRANSITION_TIME_AUTOPLAY;
    return slideshow.transitionTimeAutoPlay || constants.DEFCONF_TRANSITION_TIME_AUTOPLAY;
  }

  get slideshowTransitionTimeManual() {
    const {slideshow} = this.state;
    if (!slideshow)
      return constants.DEFCONF_TRANSITION_TIME_MANUAL;
    return slideshow.transitionTimeManual || constants.DEFCONF_TRANSITION_TIME_MANUAL;
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
    const {system} = this.state;
    if (!system)
      return {};
    return system;
  }

  get exiftoolPath() {
    const {system} = this.state;
    if (!system)
      return null;
    return system.exiftool;
  }

  get lastDialogFolder() {

    const {system} = this.state;
    if (!system)
      return null;

    return system.lastDialogFolder;
  }

  get logConfig() {

    const {system} = this.state;
    if (!system)
      return null;

    return {
      logLevelFile: system.logLevelFile,
      logLevelConsole: system.logLevelConsole,
      logfile: system.logfile,
    }
  }

  get powerSaveBlockTime() {
    const {system} = this.state;
    if (!system)
      return constants.DEFCONF_POWER_SAVE_BLOCK_TIME;
    return system.powerSaveBlockTime;
  }

  get meta2MapUrlFormat() {
    const {system} = this.state;
    if (!system)
      return constants.DEFCONF_META2MAPURL_FORMAT;
    return system.mapUrlFormat;
  }

}
