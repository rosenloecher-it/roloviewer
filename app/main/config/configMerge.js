import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import * as constants from "../../common/constants";
import * as vali from "../../common/validate";
import * as configUtils from "./configUtils";
import { validateBoolean, validateInt, validateLogLevel, validateRatingArray, validateStringArray } from "../../common/validate";

// ----------------------------------------------------------------------------------

const logKey = "configMerge"

// ----------------------------------------------------------------------------------

export function mergeDataStart(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.lastItems)
    dataFromFile.lastItems = {};

  const set = data.lastItems;

  set.container = configUtils.mergeStringItem(null,
    dataFromCli.open,
    dataFromFile.lastItems.container);

  if (set.lastContainer != null && !fs.existsSync(set.container)) {
    log.info(`${logKey} - last file/dir doesn't exist any more (${set.container})!`);
    set.container = null;
  }

  set.autoPlay = configUtils.mergeConfigItem(false,
    null,
    dataFromFile.lastItems.autoPlay);
}

// ----------------------------------------------------------------------------------

export function mergeDataSystem(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.system)
    dataFromFile.system = {};

  data.system.exiftool = configUtils.findExifTool(dataFromFile.system.exiftool);

  data.system.powerSaveBlockTime = configUtils.mergeConfigItem(constants.DEFCONF_POWER_SAVE_BLOCK_TIME,
    null,
    validateInt(dataFromFile.system.powerSaveBlockTime));

  // TODO data.system.logfile;

  data.system.logLevelFile = configUtils.mergeConfigItem(
    !data.system.isProduction ? "debug" : constants.DEFCONF_LOGLEVEL_CONSOLE,
    null,
    validateLogLevel(dataFromFile.system.logLevelFile));

  data.system.logLevelConsole = configUtils.mergeConfigItem(constants.DEFCONF_LOGLEVEL_FILE,
    null,
    validateLogLevel(dataFromFile.system.logLevelConsole));

  data.system.logDeleteOnStart = configUtils.mergeConfigItem(constants.DEFCONF_LOG_DELETE_ON_START,
    null,
    validateBoolean(dataFromFile.system.logDeleteOnStart));

  data.system.logfile = null;
  if (dataFromFile.system.logfile && dataFromFile.system.logfile.trim() === constants.DEFCONF_LOG)
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

  set.transitionTimeAutoPlay = configUtils.mergeConfigItem(constants.DEFCONF_TRANSITION_TIME_AUTOPLAY,
    null,
    validateInt(dataFromFile.slideshow.transitionTimeAutoPlay));

  set.transitionTimeManual = configUtils.mergeConfigItem(constants.DEFCONF_TRANSITION_TIME_MANUAL,
    null,
    validateInt(dataFromFile.slideshow.transitionTimeManual));

  set.timer = configUtils.mergeConfigItem(constants.DEFCONF_TIMER,
    null,
    validateInt(dataFromFile.slideshow.timer));

  set.random = configUtils.mergeConfigItem(constants.DEFCONF_RANDOM,
    dataFromCli.random,
    dataFromFile.slideshow.random);

  set.awake = configUtils.mergeConfigItem(constants.DEFCONF_AWAKE,
    null,
    validateInt(dataFromFile.slideshow.awake));

  set.screensaver = configUtils.mergeConfigItem(constants.DEFCONF_SCREENSAVER,
    dataFromCli.screensaver,
    null);

  set.details = configUtils.mergeConfigItem(constants.DEFCONF_DETAILS,
    null,
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

  set.batchCount = configUtils.mergeConfigItem(constants.DEFCONF_CRAWLER_BATCHCOUNT, validateInt(dataFromFile.crawler.batchCount), null);
  set.showRating = validateRatingArray(dataFromFile.crawler.showRating);
  set.tagShow = validateStringArray(dataFromFile.crawler.tagShow);
  set.tagBlacklist = validateStringArray(dataFromFile.crawler.tagBlacklist);
  set.folderSource = vali.validateFolderArray(dataFromFile.crawler.folderSource);
  set.folderBlacklist = vali.validateFolderArray(dataFromFile.crawler.folderBlacklist);
  set.folderBlacklistSnippets = vali.validateBlacklistSnippets(dataFromFile.crawler.folderBlacklistSnippets);

  for (let i = 0; i < set.folderBlacklist.length; i++) {
    set.folderBlacklist[i] = path.normalize(set.folderBlacklist[i]);
  }
}

// ----------------------------------------------------------------------------------

export function mergeDataMainWindow(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.mainwindow)
    dataFromFile.mainwindow = {};

  const set = data.mainwindow;

  set.x = validateInt(dataFromFile.mainwindow.x);
  set.y = validateInt(dataFromFile.mainwindow.y);
  set.height = validateInt(dataFromFile.mainwindow.height);
  set.width = validateInt(dataFromFile.mainwindow.width);

  set.maximized = configUtils.mergeConfigItem(false, validateBoolean(dataFromFile.mainwindow.maximized), null);
  set.fullscreen = configUtils.mergeConfigItem(false, validateBoolean(dataFromFile.mainwindow.fullscreen), null);
  set.activeDevTools = configUtils.mergeConfigItem(false, validateBoolean(dataFromFile.mainwindow.activeDevTools), null);

}

// ----------------------------------------------------------------------------------
