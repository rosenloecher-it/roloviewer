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
import { ConfigBase } from '../../common/configBase';

// ----------------------------------------------------------------------------------

const logKey = "configMain";

// ----------------------------------------------------------------------------------

export class ConfigMain extends ConfigBase {

  constructor() {
    super();

    this.dataCli = {};

    this.parseArgs = this.parseArgs.bind(this);
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

    if (this.isProduction())
      args = process.argv;
    else {
      // const argsString = '-r -o fff -a 12 -t 12'.split(' ');
      const argsString = constants.DEBUG_ARGS;

      if (argsString && argsString.trim().length > 0)
        args = argsString.split(' ');
    }

    const defaultConfigFile = this.getDefaultConfigFile();

    try {
      if (args) {
        log.debug("configmain.parseArgs:", args, defaultConfigFile);
        this.dataCli = parseCliArgs(args, defaultConfigFile);
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

  mergeConfig() {
    const func = ".mergeConfig";

    const setCxt = this.data.context;

    if (this.dataCli.config) {
      if (fs.existsSync(this.dataCli.config)) {
        setCxt.configfile = this.dataCli.config;
        setCxt.doSaveConfig = true;
      } else {
        log.error(`${logKey}${func} - use default config - ${this.dataCli.config} does not exists!`);
      }
    }

    if (!setCxt.configfile) {
      setCxt.configfile = this.getDefaultConfigFile();
      setCxt.doSaveConfig = true;
    }

    let dataFromFile;
    try {
      dataFromFile = configIni.loadIniFile(setCxt.configfile);
    } catch (err) {
      log.error(`${logKey}${func} loading ${this.dataCli.config} - exception: `, err);
      dataFromFile = {};
    }

    // log.debug("mergeConfigFiles - dataFromFile", dataFromFile);

    configMerge.mergeDataStart(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataSystem(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataRenderer(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataCrawler(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataMainWindow(this.data, this.dataCli, dataFromFile);

    // log.debug("mergeConfigFiles", this.data);
  }

  // ........................................................

  getDefaultConfigFile() {
    return configUtils.getDefaultConfigFile(this.isProduction() ? "" : "_test");
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
    return this.data.lastItems.container;
  }

  setLastItem(lastItemFile, lastContainer) {

    const {lastItems} = this.data;

    if (typeof(lastContainer) === typeof("str")) {
      lastItems.files = [lastItemFile];
    } else {
      if (!lastItems.files)
        lastItems.files = [lastItemFile];
      else {
        lastItems.files.push(lastItemFile);
        while (lastItems.files.length > constants.DEFCONF_CRAWLER_BATCHCOUNT)
          lastItems.files.shift();
      }
    }
    lastItems.container = lastContainer;
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

