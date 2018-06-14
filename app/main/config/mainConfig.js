import fs from 'fs';
import electron from 'electron';
import log from 'electron-log';
import deepmerge from 'deepmerge';
import parseCliArgs from "./configCli";
import * as configIni from "./configIni";
import * as constants from '../../common/constants';
import * as configWin from "./configWin";
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
      start: {},
      mainwindow: {},
      system: {},
      slideshow: {},
      crawler: {}
    };

    return data;
  }

  // ........................................................

  initContext(NODE_ENV, DEBUG_PROD) {
    this.data.system.isDevelopment = NODE_ENV === 'development' || DEBUG_PROD === 'true';
    this.data.system.isProduction = NODE_ENV === 'production';
    this.data.system.isTest = NODE_ENV === 'test';
    this.data.system.showDevTools = !this.data.system.isProduction || DEBUG_PROD === 'true' || constants.DEBUG_DEVTOOLS_PROD;
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
      console.log("ERROR ConfigMain.parseArgs: ", err)
    } finally {
      if (!this.dataCli)
        this.dataCli = {};
    }

  }

  // ........................................................

    initWindowConfig() {
    const fileConfig = configUtils.getDefaultConfigPathWin();

    const screenSize = electron.screen.getPrimaryDisplay().size;
    // log.debug("initWindowConfig - screenSize: w=", screenSize.width + ", h=" + screenSize.height);

    let data = configWin.loadConfigWindow(fileConfig);
    if (data && !configWin.checkConfigWin(data, screenSize)) {
      data = configWin.getDefaultConfigWin(screenSize);
    }

    this.data.mainwindow = Object.assign({}, data);
  }

  // ........................................................

  saveConfig() {

    if (this.data.system.saveConfigWin) {
      const fileConfig = configUtils.getDefaultConfigPathWin();
      configWin.saveConfigWindow(fileConfig, this.data.mainwindow);
    }
    if (this.data.system.saveConfigStd) {
      // TODO save to: this.data.system.configStd
    }
  }

  // ........................................................

  mergeConfigFileStandard() {

    if (this.dataCli.configStd) {
      if (fs.existsSync(this.dataCli.config))
        this.data.system.configStd = this.dataCli.config;
      else {
        console.log(`ConfigMain.mergeConfigFiles: use default config - not exists ${this.dataCli.config}`);
      }
    }

    if (!this.data.config) {
      this.data.system.configStd = configUtils.getDefaultConfigPathStd();
      this.data.system.saveConfigStd = true;
    }

    let dataFromFile;
    try {
      dataFromFile = configIni.loadIniFile(this.data.system.configStd);
    } catch (err) {
      console.log("ERROR ConfigMain.mergeConfigFiles (loadFile): ", err)
      dataFromFile = null;
    }

    // console.log("mergeConfigFiles - dataFromFile", dataFromFile);

    configMerge.mergeDataStart(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataSystem(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataRenderer(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataCrawler(this.data, this.dataCli, dataFromFile);
    configMerge.mergeDataMainWindow(this.data, this.dataCli, dataFromFile);

    // console.log("mergeConfigFiles", this.data);
  }

  // ........................................................

  mergeConfigFiles() {

    this.mergeConfigFileStandard();

  }

  // ........................................................

  exportConfig() {
    const clone = deepmerge.all([ this.data, {} ]);
    return clone;
  }

  // ........................................................

  isDevelopment() { return this.data.system.isDevelopment; }
  isProduction() { return this.data.system.isProduction; }
  isTest() { return this.data.system.isTest; }
  showDevTools() { return this.data.system.showDevTools; }

  // ........................................................

  getLogConfig() {
    if (!this.data || !this.data.system)
      return {};

    const source = this.data.system;
    return {
      loglevel_file: source.loglevel_file,
      loglevel_console: source.loglevel_console,
      logfile: source.logfile,
      log_delete_on_start: source.log_delete_on_start
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
      configWin.setWindowState(this.data.mainwindow, window);
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

  lastContainer

}

// ----------------------------------------------------------------------------------

const instanceConfigMain = new ConfigMain();

export default instanceConfigMain;

