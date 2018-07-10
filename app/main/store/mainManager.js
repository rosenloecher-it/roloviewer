import log from 'electron-log';
import path from 'path';
import deepmerge from 'deepmerge';
import configureStore from "./configureStore";
import {StoreManager} from "../../common/store/storeManager";
import * as constants from "../../common/constants";
import * as fileTools from "../config/fileTools";
import * as configMerge from "../config/configMerge";
import * as configIni from "../config/configIni";
import * as actionsContext from "../../common/store/contextActions";
import * as actionsMainWindow from "../../common/store/mainWindowActions";
import * as actionsCrawler from "../../common/store/crawlerActions";
import * as actionsSlideshow from "../../common/store/slideshowActions";
import * as actionsSystem from "../../common/store/systemActions";

// ----------------------------------------------------------------------------------

const _logKey = "mainManager";

// ----------------------------------------------------------------------------------

export class MainManager extends StoreManager {

  constructor() {
    const func = ".constructor";
    super(constants.IPC_MAIN, [constants.IPC_RENDERER, constants.IPC_WORKER ]);

    try {
      this._store = configureStore();
    } catch (err) {
      log.error(`${_logKey}${func} - creation store failed -`, err);
      throw (err);
    }
    if (!this._store)
      throw new Error(`${_logKey}${func} - cannot create store!`);
  }

  // ........................................................

  get state() {
    if (this._store)
      return this._store.getState();

    return {};
  }

  // .....................................................

  init(appContext, cliData) {
    const func = ".init";

    try {

      const defaultConfigFile = fileTools.getDefaultConfigFile(!!appContext.isProduction);
      const action = configMerge.createContextAction(appContext, cliData, defaultConfigFile);

      //log.debug(`${_logKey}${func} - action -`, action);

      this.dispatchLocal(action);

    } catch (err) {
      log.error(`${_logKey}${func} - exception -`, err);
      throw (err);
    }
  }

  // .....................................................

  loadIniFile() {
    const func = ".loadIniFile";

    let action = null;
    let iniData = null;
    let iniFile = null;

    try {
      iniFile = this.configFile;
      log.debug(`${_logKey}${func} - configFile`, iniFile);
      iniData = configIni.loadIniFile(iniFile);
    } catch (err) {
      log.error(`${_logKey}${func} - loading "${iniFile}" failed -`, err);
    }

    try {
      const {context} = this.state;

      if (!iniData)
        iniData = {};

      log.debug(`${_logKey}${func} - iniData -`, iniData);
      log.debug(`${_logKey}${func} - context -`, context);

      const defaultConfigFile = fileTools.getDefaultLogFile();
      const defaultExifTool = fileTools.findExifTool(iniData.system ? iniData.system.exiftool : null);
      action = configMerge.createSystemAction(iniData, context, defaultConfigFile, defaultExifTool);
      this.dispatchLocal(action);

      action = configMerge.createMainWindowAction(iniData, context);
      //log.debug(`${_logKey}${func} - action -`, action);
      this.dispatchLocal(action);

      action = configMerge.createSlideshowAction(iniData, context);
      this.dispatchLocal(action);

      const defaultCrawlerDb = fileTools.getDefaultCrawlerDb()
      action = configMerge.createCrawlerAction(iniData, context, defaultCrawlerDb);
      //log.debug(`${_logKey}${func} - action -`, action);
      this.dispatchLocal(action);


    } catch (err) {
      log.error(`${_logKey}${func} importing config data failed -`, err);
    }

    //log.debug(`${_logKey}${func} - data`, iniFile);
  }


  // ........................................................

  saveIniFile() {
    const func = ".saveIniFile";

    let configFile = "";
    try {

      const {context} = this.state;
      configFile = context.configFile;

      if (!configFile || context.configIsReadOnly)
        return;

      const currentState = this.state;
      const clonedState = MainManager.cloneAndFilterState(this.state);

      configIni.saveIniFile(configFile, clonedState);

    } catch (err) {
      log.error(`${_logKey}${func} failed (${configFile}) -`, err);
    }
  }

  // ........................................................

  static cloneAndFilterState(currentState) {

    const clonedState = deepmerge.all([ currentState, {} ]);

    if (clonedState.context !== undefined) delete clonedState.context;

    if (clonedState.messages !== undefined) delete clonedState.messages;

    const {slideshow} = clonedState;
    if (slideshow !== undefined) {
      if (slideshow.container !== undefined) delete slideshow.container;
      if (slideshow.containerType !== undefined) delete slideshow.containerType;
      if (slideshow.helpShow !== undefined) delete slideshow.helpShow;
      if (slideshow.items !== undefined) delete slideshow.items;
      if (slideshow.screensaver !== undefined) delete slideshow.screensaver;
      if (slideshow.showIndex !== undefined) delete slideshow.showIndex;
    }

    return clonedState;
  }

  // ........................................................

  dispatchFullState(destinations) {
    const func = ".dispatchFullState";

    let action = null;

    try {
      const currentState = this.state;

      log.debug(`${_logKey}${func} - destinations:`, destinations);

      action = actionsContext.createActionInit(currentState.context);
      this.dispatchRemote(action, destinations);

      action = actionsSystem.createActionInit(currentState.system);
      this.dispatchRemote(action);

      action = actionsMainWindow.createActionInit(currentState.mainWindow);
      this.dispatchRemote(action);

      action = actionsSlideshow.createActionInit(currentState.slideshow);
      this.dispatchRemote(action);

      action = actionsCrawler.createActionInit(currentState.crawler);
      this.dispatchRemote(action);


    } catch (err) {
      log.error(`${_logKey}${func} - failed -`, err);
      if (action != null)
        log.debug(`${_logKey}${func} - data -`, action);
    }
  }

  // ........................................................
}

// ----------------------------------------------------------------------------------

const _instanceMainManager = new MainManager();

export default _instanceMainManager;
