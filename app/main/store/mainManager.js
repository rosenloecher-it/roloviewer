import log from 'electron-log';
import deepmerge from 'deepmerge';
import configureStore from "./configureStore";
import {StoreManager} from "../../common/store/storeManager";
import * as constants from "../../common/constants";
import * as fileTools from "../../common/utils/fileUtils";
import * as iniToActions from "../iniToActions";
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
      const action = iniToActions.createContextAction(appContext, cliData, defaultConfigFile);

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
      iniData = fileTools.loadIniFile(iniFile);
    } catch (err) {
      log.error(`${_logKey}${func} - loading "${iniFile}" failed -`, err);
    }

    try {
      const {context} = this.state;

      if (!iniData)
        iniData = {};

      //log.debug(`${_logKey}${func} - iniData -`, iniData);
      //log.debug(`${_logKey}${func} - context -`, context);

      const defaultLogFile = fileTools.getDefaultLogFile(context.isProduction);
      action = iniToActions.createSystemAction(iniData, context, defaultLogFile);
      //log.debug(`${_logKey}${func} - system -`, action);
      this.dispatchLocal(action);

      action = iniToActions.createMainWindowAction(iniData, context);
      //log.debug(`${_logKey}${func} - createMainWindowAction -`, action);
      this.dispatchLocal(action);

      action = iniToActions.createSlideshowAction(iniData, context);
      //log.debug(`${_logKey}${func} - createSlideshowAction -`, action);
      this.dispatchLocal(action);

      const defaultDbPath = fileTools.getConfigPath();
      action = iniToActions.createCrawlerAction(iniData, context, defaultDbPath);
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

      if (!configFile || context.configIsReadOnly || constants.DEBUG_DONT_SAVE_CONFIG)
        return;

      const clonedState = MainManager.cloneAndFilterState(this.state);

      fileTools.saveIniFile(configFile, clonedState);

      log.debug(`${_logKey}${func} - ${configFile}`);

    } catch (err) {
      log.error(`${_logKey}${func} failed (${configFile}) -`, err);
    }
  }

  // ........................................................

  static cloneAndFilterState(currentState) {

    const clonedState = deepmerge.all([ currentState, {} ]);

    if (clonedState.context !== undefined) delete clonedState.context;
    if (clonedState.messages !== undefined) delete clonedState.messages;
    if (clonedState.renderer !== undefined) delete clonedState.renderer;
    if (clonedState.status !== undefined) delete clonedState.status;
    if (clonedState.workerState !== undefined) delete clonedState.workerState;

    return clonedState;
  }

  // ........................................................

  dispatchFullState(destinations) {
    const func = ".dispatchFullState";

    let action = null;

    try {
      const currentState = this.state;

      //log.debug(`${_logKey}${func} - destinations:`, destinations);
      //log.debug(`${_logKey}${func} - currentState:`, currentState);

      action = actionsContext.createActionInitReducer(currentState.context);
      this.dispatchRemote(action, destinations);

      action = actionsSystem.createActionInitReducer(currentState.system);
      //log.debug(`${_logKey}${func} - createActionInitReducer(system) -`, action);
      this.dispatchRemote(action);

      action = actionsMainWindow.createActionInitReducer(currentState.mainWindow);
      this.dispatchRemote(action);

      action = actionsSlideshow.createActionInitReducer(currentState.slideshow);
      //log.debug(`${_logKey}${func} - createActionInitReducer(slideshow) -`, action);
      this.dispatchRemote(action);

      action = actionsCrawler.createActionInitReducer(currentState.crawler);
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
