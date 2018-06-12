import fs from 'fs';
import electron from 'electron';
import log from 'electron-log';
import parseCliArgs from "./configCli";
import * as configIni from "./configIni";
import * as appConstants from '../../common/appConstants';
import * as configWin from "./configWin";
import * as configUtils from "./configUtils";
import configMain from "./configMain";

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
      window: {},
      system: {},
      slideshow: {},
      crawler: {}
    };

    return data;
  }

  // ........................................................

  initContext(NODE_ENV, DEBUG_PROD) {
    this.data.context.isDevelopment = NODE_ENV === 'development' || DEBUG_PROD === 'true';
    this.data.context.isProduction = NODE_ENV === 'production';
    this.data.context.isTest = NODE_ENV === 'test';
    this.data.context.showDevTools = !this.data.context.isProduction || DEBUG_PROD === 'true' || appConstants.DEBUG_DEVTOOLS_PROD;
  }

  // ........................................................

  parseArgs() {

    let args;

    if (configMain.isProduction())
      args = process.argv;
    else {
      // const argsString = '-r -o fff -a 12 -t 12'.split(' ');
      const argsString = appConstants.DEBUG_ARGS;

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

  mergeData(dataIn, dataFromCliIn, dataFromFileIn) {

    // Assignment to function parameter - no-param-reassign
    const data = dataIn;
    const dataFromCli = dataFromCliIn || {};
    const dataFromFile = dataFromFileIn || {} ;

    if (!dataFromFile.system)
      dataFromFile.system = {};
    if (!dataFromFile.slideshow)
      dataFromFile.slideshow = {};
    if (!dataFromFile.crawler)
      dataFromFile.crawler = {};

    data.system.exiftool = configUtils.findExifTool(dataFromFile.system.exiftool);

    // TODO data.system.logfile;

    data.system.loglevel_file = configUtils.mergeConfigItem(
      !this.data.context.isProduction ? "debug" : appConstants.DEFCONF_LOGLEVEL_CONSOLE,
      null,
      configUtils.validateLogLevel(dataFromFile.system.loglevel_file));

    data.system.loglevel_console = configUtils.mergeConfigItem(appConstants.DEFCONF_LOGLEVEL_FILE,
      null,
      configUtils.validateLogLevel(dataFromFile.system.loglevel_console));


    data.system.log_delete_on_start = configUtils.mergeConfigItem(appConstants.DEFCONF_LOG_DELETE_ON_START,
      null,
      configUtils.validateBoolean(dataFromFile.system.log_delete_on_start));

    data.system.logfile = null;
    if (dataFromFile.system.logfile === ".")
      data.system.logfile = configUtils.getDefaultLogFile();
    else if (!data.system.logfile)
      data.system.logfile = dataFromFile.system.logfile;

    data.slideshow.fullscreen = configUtils.mergeConfigItem(appConstants.DEFCONF_FULLSCREEN,
      dataFromCli.fullscreen,
      dataFromFile.slideshow.fullscreen);

    data.slideshow.transition = configUtils.mergeConfigItem(appConstants.DEFCONF_TRANSITION,
      configUtils.validateInt(dataFromCli.transition),
      configUtils.validateInt(dataFromFile.slideshow.transition));

    data.slideshow.random = configUtils.mergeConfigItem(appConstants.DEFCONF_RANDOM,
      dataFromCli.random,
      dataFromFile.slideshow.random);

    data.slideshow.awake = configUtils.mergeConfigItem(appConstants.DEFCONF_AWAKE,
      configUtils.validateInt(dataFromCli.awake),
      configUtils.validateInt(dataFromFile.slideshow.awake));

    data.slideshow.screensaver = configUtils.mergeConfigItem(appConstants.DEFCONF_SCREENSAVER,
      dataFromCli.screensaver,
      null);

    data.slideshow.details = configUtils.mergeConfigItem(appConstants.DEFCONF_DETAILS,
      dataFromCli.details,
      dataFromFile.slideshow.details);

    data.slideshow.open = configUtils.mergeConfigItem(null,
      dataFromCli.open,
      dataFromFile.slideshow.open);
    if (!fs.existsSync(this.data.slideshow.open))
      this.data.slideshow.open = null;

    data.crawler.database = configUtils.mergeConfigItem(configUtils.getDefaultCrawlerDb(),
      null,
      dataFromFile.crawler.database);

    data.crawler.show_rating = configUtils.validateRatingArray(dataFromFile.crawler.show_rating);
    data.crawler.tag_show = configUtils.validateStringArray(dataFromFile.crawler.tag_show);
    data.crawler.tag_blacklist = configUtils.validateStringArray(dataFromFile.crawler.tag_blacklist);
    data.crawler.path_show = configUtils.validatePathArray(dataFromFile.crawler.path_show);
    data.crawler.path_blacklist = configUtils.validatePathArray(dataFromFile.crawler.path_blacklist);


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

    this.data.window = Object.assign({}, data);
  }

  // ........................................................

  saveWindowConfig() {
    const fileConfig = configUtils.getDefaultConfigPathWin();

    configWin.saveConfigWindow(fileConfig, this.data.window);

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

    if (!this.data.config)
      this.data.system.configStd = configUtils.getDefaultConfigPathStd();

    let dataFromFile;
    try {
      dataFromFile = configIni.loadIniFile(this.data.system.configStd);
    } catch (err) {
      console.log("ERROR ConfigMain.mergeConfigFiles (loadFile): ", err)
      dataFromFile = null;
    }

    // console.log("mergeConfigFiles - dataFromFile", dataFromFile);

    this.mergeData(this.data, this.dataCli, dataFromFile);

    // console.log("mergeConfigFiles", this.data);
  }

  // ........................................................

  mergeConfigFiles() {

    this.mergeConfigFileStandard();

  }

  // ........................................................

  saveConfig() {
    // if (mainWindowState)
    //   mainWindowState.saveState(windows);

    this.saveWindowConfig();

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

  setWindowState(window) {
    if (window)
      configWin.setWindowState(this.data.window, window);
  }

  // ........................................................

  getWindowState() {
    const clone = Object.assign({}, this.data.window);
    return clone;
  }

  // ........................................................

  activeDevTools() {
    if (this.data.window)
      return !!this.data.window.activeDevTools;

    return false;
  }

  // ........................................................

  setActiveDevTools(activeDevTools) {
    if (this.data.window)
      this.data.window.activeDevTools = !!activeDevTools;
  }

  // ........................................................


}

// ----------------------------------------------------------------------------------

const instanceConfigMain = new ConfigMain();

export default instanceConfigMain;

