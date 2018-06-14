import fs from 'fs';
import log from 'electron-log';
import * as constants from "../../common/constants";
import * as configUtils from "./configUtils";

// ----------------------------------------------------------------------------------

const logKey = "configMerge"

// ----------------------------------------------------------------------------------

export function mergeDataStart(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.start)
    dataFromFile.start = {};

  const set = data.start;

  set.lastContainer = configUtils.mergeStringItem(null,
    dataFromCli.open,
    dataFromFile.start.lastContainer);

  if (set.lastContainer != null && !fs.existsSync(set.lastContainer)) {
    log.info(`${logKey} - last file/dir doesn't exist any more (${set.lastContainer})!`);
    set.lastContainer = null;
  }
}

// ----------------------------------------------------------------------------------

export function mergeDataSystem(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.system)
    dataFromFile.system = {};

  data.system.exiftool = configUtils.findExifTool(dataFromFile.system.exiftool);

  // TODO data.system.logfile;

  data.system.logLevelFile = configUtils.mergeConfigItem(
    !data.system.isProduction ? "debug" : constants.DEFCONF_LOGLEVEL_CONSOLE,
    null,
    configUtils.validateLogLevel(dataFromFile.system.logLevelFile));

  data.system.logLevelConsole = configUtils.mergeConfigItem(constants.DEFCONF_LOGLEVEL_FILE,
    null,
    configUtils.validateLogLevel(dataFromFile.system.logLevelConsole));


  data.system.logDeleteOnStart = configUtils.mergeConfigItem(constants.DEFCONF_LOG_DELETE_ON_START,
    null,
    configUtils.validateBoolean(dataFromFile.system.logDeleteOnStart));

  data.system.logfile = null;
  if (dataFromFile.system.logfile === ".")
    data.system.logfile = configUtils.getDefaultLogFile();
  else if (!data.system.logfile)
    data.system.logfile = dataFromFile.system.logfile;

}

// ----------------------------------------------------------------------------------

export function mergeDataRenderer(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.slideshow)
    dataFromFile.slideshow = {};

  const set = data.slideshow;

  set.transition = configUtils.mergeConfigItem(constants.DEFCONF_TRANSITION,
    configUtils.validateInt(dataFromCli.transition),
    configUtils.validateInt(dataFromFile.slideshow.transition));

  set.random = configUtils.mergeConfigItem(constants.DEFCONF_RANDOM,
    dataFromCli.random,
    dataFromFile.slideshow.random);

  set.awake = configUtils.mergeConfigItem(constants.DEFCONF_AWAKE,
    configUtils.validateInt(dataFromCli.awake),
    configUtils.validateInt(dataFromFile.slideshow.awake));

  set.screensaver = configUtils.mergeConfigItem(constants.DEFCONF_SCREENSAVER,
    dataFromCli.screensaver,
    null);

  set.details = configUtils.mergeConfigItem(constants.DEFCONF_DETAILS,
    dataFromCli.details,
    dataFromFile.slideshow.details);

}

// ----------------------------------------------------------------------------------

export function mergeDataCrawler(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.crawler)
    dataFromFile.crawler = {};

  const set = data.crawler;

  set.database = configUtils.mergeConfigItem(configUtils.getDefaultCrawlerDb(),
    null,
    dataFromFile.crawler.database);

  set.showRating = configUtils.validateRatingArray(dataFromFile.crawler.showRating);
  set.tagShow = configUtils.validateStringArray(dataFromFile.crawler.tagShow);
  set.tagBlacklist = configUtils.validateStringArray(dataFromFile.crawler.tagBlacklist);
  set.pathShow = configUtils.validatePathArray(dataFromFile.crawler.pathShow);
  set.pathBlacklist = configUtils.validatePathArray(dataFromFile.crawler.pathBlacklist);
}

// ----------------------------------------------------------------------------------

export function mergeDataMainWindow(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.mainwindow)
    dataFromFile.mainwindow = {};

  const set = data.mainwindow;

  set.x = configUtils.validateInt(dataFromFile.mainwindow.x);
  set.y = configUtils.validateInt(dataFromFile.mainwindow.y);
  set.height = configUtils.validateInt(dataFromFile.mainwindow.height);
  set.width = configUtils.validateInt(dataFromFile.mainwindow.width);

  set.maximized = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.maximized), null);
  set.fullscreen = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.fullscreen), null);
  set.activeDevTools = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.activeDevTools), null);

}

// ----------------------------------------------------------------------------------
