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

  data.start.lastContainer = configUtils.mergeStringItem(null,
    dataFromCli.open,
    dataFromFile.start.lastContainer);
  if (!fs.existsSync(data.start.lastContainer)) {
    log.info(`${logKey} - last file/dir doesn't exist any more (${data.start.lastContainer})!`);
    data.start.lastContainer = null;
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

  data.system.loglevel_file = configUtils.mergeConfigItem(
    !data.system.isProduction ? "debug" : constants.DEFCONF_LOGLEVEL_CONSOLE,
    null,
    configUtils.validateLogLevel(dataFromFile.system.loglevel_file));

  data.system.loglevel_console = configUtils.mergeConfigItem(constants.DEFCONF_LOGLEVEL_FILE,
    null,
    configUtils.validateLogLevel(dataFromFile.system.loglevel_console));


  data.system.log_delete_on_start = configUtils.mergeConfigItem(constants.DEFCONF_LOG_DELETE_ON_START,
    null,
    configUtils.validateBoolean(dataFromFile.system.log_delete_on_start));

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

  data.slideshow.transition = configUtils.mergeConfigItem(constants.DEFCONF_TRANSITION,
    configUtils.validateInt(dataFromCli.transition),
    configUtils.validateInt(dataFromFile.slideshow.transition));

  data.slideshow.random = configUtils.mergeConfigItem(constants.DEFCONF_RANDOM,
    dataFromCli.random,
    dataFromFile.slideshow.random);

  data.slideshow.awake = configUtils.mergeConfigItem(constants.DEFCONF_AWAKE,
    configUtils.validateInt(dataFromCli.awake),
    configUtils.validateInt(dataFromFile.slideshow.awake));

  data.slideshow.screensaver = configUtils.mergeConfigItem(constants.DEFCONF_SCREENSAVER,
    dataFromCli.screensaver,
    null);

  data.slideshow.details = configUtils.mergeConfigItem(constants.DEFCONF_DETAILS,
    dataFromCli.details,
    dataFromFile.slideshow.details);

}

// ----------------------------------------------------------------------------------

export function mergeDataCrawler(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.crawler)
    dataFromFile.crawler = {};

  data.crawler.database = configUtils.mergeConfigItem(configUtils.getDefaultCrawlerDb(),
    null,
    dataFromFile.crawler.database);

  data.crawler.show_rating = configUtils.validateRatingArray(dataFromFile.crawler.show_rating);
  data.crawler.tag_show = configUtils.validateStringArray(dataFromFile.crawler.tag_show);
  data.crawler.tag_blacklist = configUtils.validateStringArray(dataFromFile.crawler.tag_blacklist);
  data.crawler.path_show = configUtils.validatePathArray(dataFromFile.crawler.path_show);
  data.crawler.path_blacklist = configUtils.validatePathArray(dataFromFile.crawler.path_blacklist);
}

// ----------------------------------------------------------------------------------

export function mergeDataMainWindow(dataIn, dataFromCli, dataFromFileIn) {

  const data = dataIn;
  const dataFromFile = dataFromFileIn;
  if (!dataFromFile.mainwindow)
    dataFromFile.mainwindow = {};

  data.system.saveConfigWin = true;

  if (dataFromCli.fullscreen && typeof(dataFromCli.fullscreen) === typeof(true)) {
    data.mainwindow.fullscreen = true;
    data.system.saveConfigWin = false;
  }
  // TODO only one config file
  // data.slideshow.fullscreen = configUtils.mergeConfigItem(constants.DEFCONF_FULLSCREEN,
  //   dataFromCli.fullscreen,
  //   dataFromFile.slideshow.fullscreen);
}

// ----------------------------------------------------------------------------------
