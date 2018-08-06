import fs from 'fs';
import log from 'electron-log';
import { app } from "electron";
import * as actionsContext from '../common/store/contextActions';
import * as actionsCrawler from '../common/store/crawlerActions';
import * as actionsMainWindow from '../common/store/mainWindowActions';
import * as actionsSlideshow from '../common/store/slideshowActions';
import * as actionsSystem from '../common/store/systemActions';
import * as constants from '../common/constants';
import * as fileUtils from '../common/utils/fileUtils';
import { SlideshowReducer } from '../common/store/slideshowReducer';
import {
  mergeBoolItem,
  mergeConfigItem,
  mergeIntItem,
  valiBoolean,
  valiInt,
  valiLogLevel,
  valiRatingArray,
  valiString,
  valiTagArray,
  valiFolderArray,
  valiBlacklistSnippets,
  valiUrl,
  valiDir
} from '../common/utils/validate';

// ----------------------------------------------------------------------------------

const _logKey = 'iniToActions';
const _specialSetting = ' - special setting -';

// ----------------------------------------------------------------------------------

export function createContextAction(appContext, cliData, defaultConfigFile) {
  const func = '.createContextAction';

  const actionData = {
    isDevelopment: appContext.isDevelopment,
    isDevtool: appContext.isDevtool,
    isProduction: appContext.isProduction,
    isTest: appContext.isTest,
  };

  if (cliData.configfile) {
    if (!fs.existsSync(cliData.configfile))
      log.info(
        `${_logKey}${func} - cli config file "${
          cliData.configfile
        }" does not exist!`
      );
    actionData.configFile = valiString(cliData.configfile);
  } else actionData.configFile = defaultConfigFile;

  actionData.configIsReadOnly = valiBoolean(cliData.configreadonly) || false;
  actionData.isScreensaver = valiBoolean(cliData.screensaver) || false;
  actionData.tempCliAutoplay = valiBoolean(cliData.play) || null;
  actionData.tempCliAutoselect = valiBoolean(cliData.autoselect) || null;
  actionData.tempCliFullscreen = valiBoolean(cliData.fullscreen) || null;
  actionData.tempCliRandom = valiBoolean(cliData.random) || null;

  actionData.exePath = app.getPath('exe');
  actionData.versionElectron = process.versions.electron;

  if (!actionData.tempCliAutoselect && cliData.open)
    actionData.tempCliOpenContainer = valiString(cliData.open);
  else actionData.tempCliOpenContainer = null;

  const action = actionsContext.createActionInitReducer(actionData);

  // special settings
  if (actionData.isScreensaver) {
    if (!actionData.configIsReadOnly) {
      log.debug(`${_logKey}${func}${_specialSetting} activate "configIsReadOnly" when "cli.isScreensaver"`);
      actionData.configIsReadOnly = true;
    }
  }

  return action;
}

// ----------------------------------------------------------------------------------

export function createCrawlerAction(iniDataIn, context, defaultCrawlerDb) {
  const func = '.createCrawlerAction';

  const iniData = iniDataIn;
  if (!iniData.crawler)
    iniData.crawler = {};

  const actionData = {};

  actionData.databasePath = mergeConfigItem(defaultCrawlerDb,
    null,
    iniData.crawler.databasePath);

  actionData.batchCount = mergeIntItem(constants.DEFCONF_CRAWLER_BATCHCOUNT, iniData.crawler.batchCount);
  actionData.showRating = valiRatingArray(iniData.crawler.showRating);
  actionData.tagShow = valiTagArray(iniData.crawler.tagShow);
  actionData.tagBlacklist = valiTagArray(iniData.crawler.tagBlacklist);
  actionData.folderSource = valiFolderArray(iniData.crawler.folderSource);
  actionData.folderBlacklist = valiFolderArray(iniData.crawler.folderBlacklist);
  actionData.folderBlacklistSnippets = valiBlacklistSnippets(iniData.crawler.folderBlacklistSnippets);
  actionData.maxFilesPerFolder = mergeIntItem(constants.DEFCONF_MAX_ITEMS_PER_CONTAINER, iniData.crawler.maxFilesPerFolder);
  actionData.updateDirsAfterMinutes = mergeIntItem(constants.DEFCONF_CRAWLER_UPDATE_DIRS_AFTER_MINUTES, iniData.crawler.updateDirsAfterMinutes);

  actionData.weightingRating = mergeIntItem(constants.DEFCONF_CRAWLER_WEIGHTING_RATING, iniData.crawler.weightingRating);
  actionData.weightingRepeated = mergeIntItem(constants.DEFCONF_CRAWLER_WEIGHTING_REPEATED, iniData.crawler.weightingRepeated);
  actionData.weightingSeason = mergeIntItem(constants.DEFCONF_CRAWLER_WEIGHTING_SEASON, iniData.crawler.weightingSeason);
  actionData.weightingSelPow = mergeIntItem(constants.DEFCONF_CRAWLER_WEIGHTING_SELPOW, iniData.crawler.weightingSelPow);


  do {
    if (context.tempCliAutoselect !== true)
      break;
    if (!context.tempCliOpenContainer)
      break;
    if (!fileUtils.isDirectory(context.tempCliOpenContainer))
      break;

    log.debug(`${_logKey}${func}${_specialSetting} reconfigure "folderSource" via "cli"`);
    actionData.folderSource = [context.tempCliOpenContainer];

  } while (false);

  const action = actionsCrawler.createActionInitReducer(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createMainWindowAction(iniDataIn, context) {
  const func = '.createMainWindowAction';

  const iniData = iniDataIn;
  if (!iniData.mainWindow)
    iniData.mainWindow = {};

  const actionData = {
    x: valiInt(iniData.mainWindow.x),
    y: valiInt(iniData.mainWindow.y),
    height: valiInt(iniData.mainWindow.height),
    width: valiInt(iniData.mainWindow.width),
    maximized: mergeBoolItem(false, iniData.mainWindow.maximized),
    fullscreen: mergeBoolItem(false, iniData.mainWindow.fullscreen),
    activeDevtool: mergeBoolItem(false, iniData.mainWindow.activeDevtool),
  };

  if (context.tempCliFullscreen === true)
    actionData.fullscreen = true;

  if (context.isScreensaver) {
    if (actionData.activeDevtool) {
      log.debug(`${_logKey}${func}${_specialSetting} disable "activeDevtool" when "cli.isScreensaver"`);
      actionData.activeDevtool = false;
    }
    if (!actionData.fullscreen) {
      log.debug(`${_logKey}${func}${_specialSetting} activate "fullscreen" when "cli.isScreensaver"`);
      actionData.fullscreen = true;
    }
  }

  const action = actionsMainWindow.createActionInitReducer(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createSlideshowAction(iniDataIn, context) {
  const func = '.createSlideshowAction';

  const iniData = iniDataIn;
  if (!iniData.slideshow)
    iniData.slideshow = {};

  const actionData = {};

  actionData.autoPlay = mergeBoolItem(false, iniData.slideshow.autoPlay);
  actionData.random = mergeBoolItem(constants.DEFCONF_RANDOM, iniData.slideshow.random);

  actionData.detailsPosition = SlideshowReducer.valiDetailsPosition(valiString(iniData.slideshow.detailsPosition));
  actionData.detailsShortenText = mergeIntItem(constants.DEFCONF_DETAILS_TEXT_SHORTEN, iniData.slideshow.detailsShortenText);
  actionData.detailsState = SlideshowReducer.getValidDetailsState(valiString(iniData.slideshow.detailsState), false);

  const tempCrawlerInfoPosition = valiString(iniData.slideshow.crawlerInfoPosition);
  actionData.crawlerInfoPosition = SlideshowReducer.valiCrawlerInfoPosition(tempCrawlerInfoPosition, actionData.detailsPosition);
  actionData.crawlerInfoShow = mergeBoolItem(false, iniData.slideshow.crawlerInfoShow);

  actionData.transitionTimeAutoPlay = mergeIntItem(constants.DEFCONF_TRANSITION_TIME_AUTOPLAY, iniData.slideshow.transitionTimeAutoPlay);
  actionData.transitionTimeManual = mergeIntItem(constants.DEFCONF_TRANSITION_TIME_MANUAL, iniData.slideshow.transitionTimeManual);
  actionData.timer = mergeIntItem(constants.DEFCONF_TIMER, iniData.slideshow.timer);

  // set default data
  actionData.lastContainerType = constants.CONTAINER_UNKNOWN;
  actionData.lastContainer = null;
  actionData.lastItem = null;

  if (context.tempCliAutoselect) {
    actionData.lastContainerType = constants.CONTAINER_AUTOSELECT;
    actionData.lastContainer = null;
    actionData.lastItem = null;
  } else {
    if (context.tempCliOpenContainer) {
      if (fs.existsSync(actionData.tempCliOpenContainer)) {
        const isDir = fileUtils.isDirectory(context.tempCliOpenContainer);
        actionData.lastContainerType = isDir ? constants.CONTAINER_FOLDER : constants.CONTAINER_PLAYLIST;
        actionData.lastContainer = context.tempCliOpenContainer;
        actionData.lastItem = null;
      } else {
        log.info(`${_logKey}.createSlideshowAction - last file/dir doesn't exist (${context.tempCliOpenContainer})!`);
        actionData.lastContainerType = null;
        actionData.lastContainer = null;
        actionData.lastItem = null;
      }
    } else {
      const lastContainerType = valiInt(iniData.slideshow.lastContainerType);
      if (lastContainerType === constants.CONTAINER_AUTOSELECT
        || lastContainerType === constants.CONTAINER_FOLDER
        || lastContainerType === constants.CONTAINER_PLAYLIST) {
        actionData.lastContainerType = lastContainerType;
        actionData.lastContainer = valiString(iniData.slideshow.lastContainer);
        actionData.lastItem = valiString(iniData.slideshow.lastItem);
      }
    }
  }

  if (context.isScreensaver) {
    if (!actionData.autoPlay) {
      log.debug(`${_logKey}${func}${_specialSetting} activate "autoplay" when "cli.isScreensaver"`);
      actionData.autoPlay = true;
    }
  } else if (actionData.tempCliOpenContainer) {
    if (actionData.autoPlay) {
      log.debug(`${_logKey}${func}${_specialSetting} disable "autoplay" when "cli.open*"`);
      actionData.autoPlay = false;
    }
    if (actionData.random && actionData.tempCliRandom === null) {
      log.debug(`${_logKey}${func}${_specialSetting} disable "random" when "cli.open*"`);
      actionData.random = false;
    }
  }

  const action = actionsSlideshow.createActionInitReducer(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createSystemAction(iniDataIn, context, defaultLogFile) {
  const iniData = iniDataIn;
  if (!iniData.system)
    iniData.system = {};

  const actionData = {};

  actionData.exiftool = valiString(iniData.system.exiftool);
  if (actionData.exiftool === null)
    actionData.exiftool = constants.DEFCONF_EXIFTOOL_INTERN;

  actionData.powerSaveBlockTime = mergeIntItem(constants.DEFCONF_POWER_SAVE_BLOCK_TIME, iniData.system.powerSaveBlockTime);

  actionData.lastDialogFolder = valiDir(iniData.system.lastDialogFolder);

  const defaulLogLevel = !context.isProduction ? "debug" : constants.DEFCONF_LOGLEVEL;
  actionData.logLevelFile = mergeConfigItem(defaulLogLevel, valiLogLevel(iniData.system.logLevelFile));
  actionData.logLevelConsole = mergeConfigItem(defaulLogLevel, valiLogLevel(iniData.system.logLevelConsole));

  actionData.mapUrlFormat = mergeConfigItem(constants.DEFCONF_META2MAPURL_FORMAT,
    valiUrl(iniData.system.mapUrlFormat));

  actionData.logfile = defaultLogFile;
  if (iniData.system.logfile && iniData.system.logfile.trim() !== constants.DEFCONF_LOG)
    actionData.logfile = iniData.system.logfile;

  const action = actionsSystem.createActionInitReducer(actionData);

  return action;
}

// ----------------------------------------------------------------------------------
