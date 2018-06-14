import fs from 'fs';
import path from 'path';
import electron from 'electron';
import log from 'electron-log';
import deepmerge from 'deepmerge';
import parseCliArgs from "./configCli";
import * as configIni from "./configIni";
import * as constants from '../../common/constants';
import * as configUtils from "./configUtils";
import * as configMerge from "./configMerge";
import configMain from "./mainConfig";

// ----------------------------------------------------------------------------------

const logKey = "configMain";

// ----------------------------------------------------------------------------------

export class ConfigMain {

  constructor() {

    // to test whether we have singleton or not
    this.time = new Date();

    this.dataCli = {};
    this.data = ConfigMain.createDefaultData();
  }

  // ........................................................

  static createDefaultData() {
    const data = {
      context: {},
      crawler: {},
      mainwindow: {},
      slideshow: {},
      start: {},
      system: {}
    };

    return data;
  }

  // ........................................................

  initContext(NODE_ENV, DEBUG_PROD) {
    this.data.context.isDevelopment = NODE_ENV === 'development' || DEBUG_PROD === 'true';
    this.data.context.isProduction = NODE_ENV === 'production';
    this.data.context.isTest = NODE_ENV === 'test';
    this.data.context.showDevTools = !this.data.system.isProduction || DEBUG_PROD === 'true' || constants.DEBUG_DEVTOOLS_PROD;
  }

  // ........................................................

  parseArgs() {

    let args;

    if (configMain.isProduction())
      args = process.argv;
    else {
      // const argsString = '-r -o fff -a 12 -t 12'.split(' ');
      const argsString = constants.DEBUG_ARGS;

      if (argsString && argsString.trim().length > 0)
        args = argsString.split(' ');
    }

    try {
      if (args) {
        log.debug("configmain.parseArgs:", args);
        this.dataCli = parseCliArgs(args);
      } else
        this.dataCli = {};
    } catch (err) {
      log.error(`${logKey}.parseArgs - exception`, err);
    } finally {
      if (!this.dataCli)
        this.dataCli = {};
    }

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

    if (this.data.context.doSaveConfig) {
      const fileConfig = configUtils.getDefaultConfigPath();

      try {


        const dataClone = this.exportConfig();

        delete dataClone.context;

        if (dataClone.system.logfile === configUtils.getDefaultLogFile())
          dataClone.system.logfile = ".";

        configIni.saveIniFile(fileConfig, dataClone);

      } catch (err) {
        log.error(`${logKey}.saveConfig (${fileConfig}):`, err);
      }
    }
  }

  // ........................................................

  mergeConfig() {
    const func = ".mergeConfig";

    const setSys = this.data.system;

    if (this.dataCli.config) {
      if (fs.existsSync(this.dataCli.config)) {
        setSys.config = this.dataCli.config;
        this.data.context.doSaveConfig = true;
      } else {
        log.error(`${logKey}${func} - use default config - not exists ${this.dataCli.config}`);
      }
    }

    if (!setSys.config) {
      setSys.config = configUtils.getDefaultConfigPath();
      this.data.context.doSaveConfig = true;
    }

    let dataFromFile;
    try {
      dataFromFile = configIni.loadIniFile(setSys.config);
    } catch (err) {
      log.error(`${logKey}${func} loading ${this.dataCli.config} - exception: `, err);
      dataFromFile = {};
    }

     log.debug("mergeConfigFiles - dataFromFile", dataFromFile);

    configMerge.mergeDataStart(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataSystem(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataRenderer(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataCrawler(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataMainWindow(this.data, this.dataCli, dataFromFile);

     log.debug("mergeConfigFiles", this.data);
  }

  // ........................................................

  exportConfig() {
    const clone = deepmerge.all([ this.data, {} ]);
    return clone;
  }

  // ........................................................

  isDevelopment() { return this.data.context.isDevelopment; }
  isProduction() { return this.data.context.isProduction; }
  isTest() { return this.data.context.isTest; }
  showDevTools() { return this.data.context.showDevTools; }

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

  shouldExit() {
    return (this.dataCli && this.dataCli.exit_code);
  }

  // ........................................................

  getExitCode() {
    if (this.dataCli)
      return this.dataCli.exit_code;

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

  getLastContainer() {
    return this.data.start.lastContainer;
  }

  setLastContainer(lastContainer) {
    this.data.start.lastContainer = lastContainer;
  }

  // ........................................................

  getLastPath() {

    let lastPath = this.data.start.lastPath;
    if (lastPath && fs.existsSync(lastPath))
      return lastPath;

    const lastContainer = this.data.start.lastContainer;
    if (lastContainer && fs.existsSync(lastContainer)) {
      if (fs.lstatSync(lastContainer).isDirectory())
        return lastContainer;

      if (fs.lstatSync(lastContainer).isFile()) {
        lastPath = path.dirname(lastContainer);
        return lastPath;
      }
    }

    lastPath = electron.app.getPath('userData');
    return lastPath;
  }

  setLastPath(lastPath) {
    this.data.start.lastPath = lastPath;
  }

  // ........................................................


  lastContainer

}

// ----------------------------------------------------------------------------------

const instanceConfigMain = new ConfigMain();

export default instanceConfigMain;

