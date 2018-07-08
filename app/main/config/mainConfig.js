import fs from 'fs';
import path from 'path';
import electron from 'electron';
import log from 'electron-log';
import * as configIni from "./configIni";
import * as constants from '../../common/constants';
import * as configUtils from "./configUtils";
import * as configMerge from "./configMerge";
import { ConfigBase } from '../../common/configBase';
import Cli from "./cli";

// ----------------------------------------------------------------------------------

const logKey = "configMain";

// ----------------------------------------------------------------------------------

export class ConfigMain extends ConfigBase {

  constructor() {
    super();

  }

  // ........................................................

  initContext(app) {

    const { data } = this;

    data.context.isDevelopment = app.isDevelopment;
    data.context.isProduction = app.isProduction;
    data.context.isTest = app.isTest;
    data.context.showDevTools = app.showDevTools;

    const extra = (data.context.isProduction ? "" : "_test");
    const configPath = configUtils.getConfigPath();
    const configName = `${constants.CONFIG_BASENAME}${extra}.ini`;

    data.context.defaultConfigFile = path.join(configPath, configName);

    if (!data.context.isProduction) {
      const cliName = `${constants.CONFIG_BASENAME}${extra}.cli`;
      data.context.testCliFile = path.join(configPath, cliName);
    }

    //console.log(`${logKey}.initContext - data.context=`, data.context);
  }

  // ........................................................

  checkMainWindowBounds() {
    const screenSize = electron.screen.getPrimaryDisplay().size;

    const config = this.data.mainwindow;

    let resetBounds = true;
    const space = 100;
    do {
      if (!config.x || config.x < 0 || config.x >= screenSize.width - space)
        break;
      if (!config.y || config.y < 0 || config.y >= screenSize.height - space)
        break;
      if (!config.height || config.height < constants.DEFCONF_HEIGHT_DEF || config.height > screenSize.height)
        break;
      if (!config.width || config.width < constants.DEFCONF_WIDTH_DEF || config.width > screenSize.width)
        break;

      resetBounds = false;

    } while (false);

    if (resetBounds) {
      config.height = screenSize.height < constants.DEFCONF_HEIGHT_DEF ? screenSize.height : constants.DEFCONF_HEIGHT_DEF;
      config.width = screenSize.width < constants.DEFCONF_WIDTH_DEF ? screenSize.width : constants.DEFCONF_WIDTH_DEF;

      config.x = (screenSize.width - config.width) / 2;
      config.y = (screenSize.height - config.height) / 2;
    }

    // don't reset: config.maximized + config.fullscreen + config.activeDevTools

  }

  // ........................................................

  saveConfig() {

    if (!this.data.context.configIsReadOnly) {
      const {configfile} = this.data.context;

      try {


        const dataClone = this.exportData();

        delete dataClone.context;

        if (dataClone.system.logfile === configUtils.getDefaultLogFile())
          dataClone.system.logfile = constants.DEFCONF_LOG;
        else if (!dataClone.system.logfile)
          delete dataClone.system.logfile;

        configIni.saveIniFile(configfile, dataClone);

      } catch (err) {
        log.error(`${logKey}.saveConfig (${configfile}):`, err);
      }
    }
  }

  // ........................................................

  mergeConfig(cliData) {
    const func = ".mergeConfig";

    const setCxt = this.data.context;

    if (!cliData)
      cliData = {};

    setCxt.configIsReadOnly = !!cliData.configreadonly;

    if (cliData.config) {
      if (fs.existsSync(cliData.config)) {
        setCxt.configfile = cliData.config;
      } else {
        log.error(`${logKey}${func} - use default config - ${cliData.config} does not exists!`);
      }
    }

    if (!setCxt.configfile) {
      setCxt.configfile = this.defaultConfigFile;
    }

    let dataFromFile;
    try {
      dataFromFile = configIni.loadIniFile(setCxt.configfile);
    } catch (err) {
      log.error(`${logKey}${func} loading ${this.cliData.config} - exception: `, err);
      dataFromFile = {};
    }

    // log.debug("mergeConfigFiles - dataFromFile", dataFromFile);

    configMerge.mergeDataStart(this.data, cliData, dataFromFile);
    configMerge.mergeDataSystem(this.data, cliData, dataFromFile);
    configMerge.mergeDataRenderer(this.data, cliData, dataFromFile);
    configMerge.mergeDataCrawler(this.data, cliData, dataFromFile);
    configMerge.mergeDataMainWindow(this.data, cliData, dataFromFile);

    // log.debug("mergeConfigFiles", this.data);
  }

  // ........................................................

  getLogConfig() {
    if (!this.data || !this.data.system)
      return {};

    const source = this.data.system;
    return {
      logLevelFile: source.logLevelFile,
      logLevelConsole: source.logLevelConsole,
      logfile: source.logfile,
      logDeleteOnStart: source.logDeleteOnStart
    }
  }

  // ........................................................

  getExitCode() {
    if (this.cliData)
      return this.cliData.exitCode;

    return null;
  }

  // ........................................................

  setMainWindowState(window) {
    if (window)
      configUtils.setWindowState(this.data.mainwindow, window);
  }

  // ........................................................

  getMainWindowState() {
    const clone = Object.assign({}, this.data.mainwindow);
    return clone;
  }

  // ........................................................

  activeDevTools() {
    if (this.data.mainwindow)
      return !!this.data.mainwindow.activeDevTools;

    return false;
  }

  // ........................................................

  setActiveDevTools(activeDevTools) {
    if (this.data.mainwindow)
      this.data.mainwindow.activeDevTools = !!activeDevTools;
  }

  // ........................................................

  getLastDialogFolder() {

    let dialogFolder = this.data.lastItems.dialogFolder;
    if (dialogFolder && fs.existsSync(dialogFolder))
      return dialogFolder;

    const lastContainer = this.data.lastItems.container;
    if (lastContainer && fs.existsSync(lastContainer)) {
      if (fs.lstatSync(lastContainer).isDirectory())
        return lastContainer;

      if (fs.lstatSync(lastContainer).isFile()) {
        dialogFolder = path.dirname(lastContainer);
        return dialogFolder;
      }
    }

    dialogFolder = electron.app.getPath('userData');
    return dialogFolder;
  }

  setLastDialogFolder(dialogFolder) {
    this.data.lastItems.dialogFolder = dialogFolder;
  }

  // ........................................................



}

// ----------------------------------------------------------------------------------

const instanceConfigMain = new ConfigMain();

export default instanceConfigMain;

