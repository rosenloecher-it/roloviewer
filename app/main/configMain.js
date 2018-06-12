import fs from 'fs';
import electron from 'electron';
import * as configCli from "./configCli";
import * as configIni from "./configIni";
import * as appConstants from '../common/appConstants';
import {isProduction} from "./main.dev";
import * as configWin from "./configWin";
import * as configUtils from "./configUtils";

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
      window: {},
      system: {},
      slideshow: {},
      crawler: {}
    };

    return data;
  }

  // ........................................................

  parseCli() {

    let args;

    if (isProduction)
      args = process.argv;
    else {
      // const argsString = '-r -o fff -a 12 -t 12'.split(' ');
      const argsString = appConstants.DEBUG_ARGS;

      if (!argsString && argsString.trim.length > 0)
        args = (argsString).split(' ');
    }

    try {
      if (args) {
        console.log("parseCli - args:", args);
        this.dataCli = configCli.parseCli(args);
      } else
        this.dataCli = {};
    } catch (err) {
      console.log("ERROR ConfigMain.parseCli: ", err)
    } finally {
      if (!this.dataCli)
        this.dataCli = {};
    }

  }

  // ........................................................

  mergeData(data, dataFromCli, dataFromFile) {

    if (!dataFromCli)
      dataFromCli = {};

    if (!dataFromFile)
      dataFromFile = {};
    if (!dataFromFile.system)
      dataFromFile.system = {};
    if (!dataFromFile.slideshow)
      dataFromFile.slideshow = {};
    if (!dataFromFile.crawler)
      dataFromFile.crawler = {};

    data.system.exiftool = configUtils.findExifTool(dataFromFile.system.exiftool);


    //TODO data.system.logfile;

    let defaultLogLevel = "warn";
    if (!isProduction)
      defaultLogLevel = "debug";

    data.system.loglevel = configUtils.mergeConfigItem(defaultLogLevel,
      null,
      configUtils.validateLogLevel(dataFromFile.system.loglevel));

    data.system.log_delete_on_start = configUtils.mergeConfigItem(false,
      null,
      configUtils.validateBoolean(dataFromFile.system.log_delete_on_start));




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

    data.crawler.database = configUtils.mergeConfigItem(configIni.getDefaultCreawlerDb(),
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
    const fileConfig = configIni.getDefaultConfigPathWin();

    const screenSize = electron.screen.getPrimaryDisplay().size;
    //log.debug("initWindowConfig - screenSize: w=", screenSize.width + ", h=" + screenSize.height);

    let data = configWin.loadConfigWindow(fileConfig);
    if (data && !configWin.checkConfigWin(data, screenSize)) {
      data = configWin.getDefaultConfigWin(screenSize);
    }

    this.data.window = Object.assign({}, data);
  }

  // ........................................................

  saveWindowConfig() {
    const fileConfig = configIni.getDefaultConfigPathWin();

    configWin.saveConfigWindow(fileConfig, this.data.window);

  }

  // ........................................................

  mergeConfigFileStandard() {

    if (this.dataCli.configStd) {
      if (fs.existsSync(this.dataCli.config))
        this.data.system.configStd = this.dataCli.config;
      else {
        console.log("ConfigMain.mergeConfigFiles: use default config - not exists: " + this.dataCli.config);
      }
    }

    if (!this.data.config)
      this.data.system.configStd = configIni.getDefaultConfigPathStd();

    let dataFromFile;
    try {
      dataFromFile = configIni.loadIniFile(this.data.system.configStd);
    } catch (err) {
      console.log("ERROR ConfigMain.mergeConfigFiles (loadFile): ", err)
      dataFromFile = null;
    }

    //console.log("mergeConfigFiles - dataFromFile", dataFromFile);

    this.mergeData(this.data, this.dataCli, dataFromFile);

    //console.log("mergeConfigFiles", this.data);
  }

  // ........................................................

  mergeConfigFiles() {

    this.mergeConfigFileStandard();

  }

  // ........................................................

  saveConfig() {
    // if (mainWindowState)
    //   mainWindowState.saveState(mainWindow);

    this.saveWindowConfig();

  }

  // ........................................................

  shouldExit() {
    return (this.dataCli && this.dataCli.exit_code);
  }

  // ........................................................

  getExitCode() {
    if (this.dataCli)
      return this.dataCli.exit_code;
    else
      return null;
  }

  // ........................................................

  setWindowState(window) {
    if (window)
      configWin.setWindowState(this.data.window, window);
  }

  // ........................................................

  getWindowState() {
    var clone = Object.assign({}, this.data.window);
    return clone;
  }




  isMaximized() {
    if (this.data.window && config.maximized === true)
      return true;
    else
      return false;
  }

  // ........................................................

  window() {

  }
  // width: mainWindowState.width,
  // height: mainWindowState.height,
  // x: mainWindowState.x,
  // y: mainWindowState.y,

}

// ----------------------------------------------------------------------------------



const instanceConfigMain = new ConfigMain();

export default instanceConfigMain;

