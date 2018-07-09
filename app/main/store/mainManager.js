import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import configureStore from "./configureStore";
import {StoreManager} from "../../common/store/storeManager";
import * as constants from "../../common/constants";
import * as actionsCtx from "../../common/store/contextActions";
import * as configUtils from "../config/configUtils";
import * as configMerge from "../config/configMerge";
import * as configIni from "../config/configIni";

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

      const actionData = {
        isDevelopment: appContext.isDevelopment,
        isProduction: appContext.isProduction,
        isTest: appContext.isTest,
        isDevTool: appContext.isDevTool,
      };

      const extra = (actionData.isProduction ? "" : "_test");
      const configPath = configUtils.getConfigPath();
      const configName = `${constants.CONFIG_BASENAME}${extra}.ini`;
      actionData.defaultConfigFile = path.join(configPath, configName);

      actionData.configIsReadOnly = false;

      if (cliData) {
        actionData.configIsReadOnly = !!cliData.configreadonly;

        if (cliData.config) {
          if (fs.existsSync(cliData.config)) {
            actionData.configfile = cliData.config;
          } else {
            log.error(`${_logKey}${func} - use default config - ${cliData.config} does not exists!`);
          }
        }
      }

      if (!actionData.configFile)
        actionData.configFile = actionData.defaultConfigFile;

      const action = actionsCtx.createActionInit(actionData);

      //log.debug(`${_logKey}${func} - action -`, action);

      this.dispatchLocal(action);

    } catch (err) {
      log.error(`${_logKey}${func} - exception -`, err);
      throw (err);
    }
  }

  // .....................................................

  loadIni() {
    const func = ".loadIni";

    try {

      log.debug(`${_logKey}${func} - configFile`, this.configFile);



    } catch (err) {
      log.error(`${_logKey}${func} - exception -`, err);
      throw (err);
    }
    //
    // let dataFromFile;
    // try {
    //   dataFromFile = configIni.loadIniFile(setCxt.configfile);
    // } catch (err) {
    //   log.error(`${_logKey}${func} loading ${this.cliData.config} - exception: `, err);
    //   dataFromFile = {};
    // }
    //
    // // log.debug("mergeConfigFiles - dataFromFile", dataFromFile);
    //
    // configMerge.mergeDataStart(this.data, cliData, dataFromFile);
    // configMerge.mergeDataSystem(this.data, cliData, dataFromFile);
    // configMerge.mergeDataRenderer(this.data, cliData, dataFromFile);
    // configMerge.mergeDataCrawler(this.data, cliData, dataFromFile);
    // configMerge.mergeDataMainWindow(this.data, cliData, dataFromFile);
    //
    // // log.debug("mergeConfigFiles", this.data);
  }


  // ........................................................

}

// ----------------------------------------------------------------------------------

const _instanceMainManager = new MainManager();

export default _instanceMainManager;
