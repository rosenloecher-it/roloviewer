import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import * as constants from "../common/constants";
import {
  mergeConfigItem,
  valiBoolean, valiInt, valiLogLevel, valiRatingArray, valiString, valiTagArray,
  valiFolderArray, valiBlacklistSnippets
} from "../common/utils/validate";
import * as actionsContext from "../common/store/contextActions";
import * as actionsCrawler from "../common/store/crawlerActions";
import * as actionsMainWindow from "../common/store/mainWindowActions";
import * as actionsSlideshow from "../common/store/slideshowActions";
import * as actionsSystem from "../common/store/systemActions";
import { SlideshowReducer } from "../common/store/slideshowReducer";

// ----------------------------------------------------------------------------------

const _logKey = "iniToActions";

// ----------------------------------------------------------------------------------

export function createContextAction(appContext, cliData, defaultConfigFile) {
  const func = ".createContextAction";

  const actionData = {
    isDevelopment: appContext.isDevelopment,
    isDevtool: appContext.isDevtool,
    isProduction: appContext.isProduction,
    isTest: appContext.isTest,
  };

  if (cliData.configfile) {
    if (!fs.existsSync(cliData.configfile))
      log.info(`${_logKey}${func} - cli config file "${cliData.configfile}" does not exist!`);
    actionData.configFile = valiString(cliData.configfile);
  } else
    actionData.configFile = defaultConfigFile;


  actionData.configIsReadOnly = valiBoolean(cliData.configreadonly) || false;
  actionData.tempCliFullscreen = valiBoolean(cliData.fullscreen) || false;
  actionData.tempCliScreensaver = valiBoolean(cliData.screensaver) || false;
  actionData.tempCliAutoplay = valiBoolean(cliData.play) || false;
  actionData.tempCliAutoselect = valiBoolean(cliData.autoselect) || false;


  if (!actionData.tempCliAutoselect && cliData.open)
    actionData.tempCliOpenContainer = valiString(cliData.open);
  else
    actionData.tempCliOpenContainer = null;

  const action = actionsContext.createActionInit(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createCrawlerAction(iniDataIn, context, defaultCrawlerDb) {

  const iniData = iniDataIn;
  if (!iniData.crawler)
    iniData.crawler = {};

  const actionData = {};

  actionData.database = mergeConfigItem(defaultCrawlerDb,
    null,
    iniData.crawler.database);

  actionData.batchCount = mergeConfigItem(constants.DEFCONF_CRAWLER_BATCHCOUNT, valiInt(iniData.crawler.batchCount), null);
  actionData.showRating = valiRatingArray(iniData.crawler.showRating);
  actionData.tagShow = valiTagArray(iniData.crawler.tagShow);
  actionData.tagBlacklist = valiTagArray(iniData.crawler.tagBlacklist);
  actionData.folderSource = valiFolderArray(iniData.crawler.folderSource);
  actionData.folderBlacklist = valiFolderArray(iniData.crawler.folderBlacklist);
  actionData.folderBlacklistSnippets = valiBlacklistSnippets(iniData.crawler.folderBlacklistSnippets);

  for (let i = 0; i < actionData.folderBlacklist.length; i++) {
    actionData.folderBlacklist[i] = path.normalize(actionData.folderBlacklist[i]);
  }

  const action = actionsCrawler.createActionInit(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createMainWindowAction(iniDataIn, context) {

  const iniData = iniDataIn;
  if (!iniData.mainWindow)
    iniData.mainWindow = {};

  const actionData = {
    x: valiInt(iniData.mainWindow.x),
    y: valiInt(iniData.mainWindow.y),
    height: valiInt(iniData.mainWindow.height),
    width: valiInt(iniData.mainWindow.width),
    maximized: mergeConfigItem(false, valiBoolean(iniData.mainWindow.maximized) || false, null),
    fullscreen: mergeConfigItem(false, valiBoolean(iniData.mainWindow.fullscreen), null),
    activeDevtool: mergeConfigItem(false, valiBoolean(iniData.mainWindow.activeDevtool), null),
  };

  if (context.tempCliFullscreen === true)
    actionData.fullscreen = true;

  const action = actionsMainWindow.createActionInit(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createSlideshowAction(iniDataIn, context) {

  const iniData = iniDataIn;
  if (!iniData.slideshow)
    iniData.slideshow = {};

  const actionData = {};

  actionData.autoPlay = mergeConfigItem(false,
    null,
    iniData.slideshow.autoPlay);

  actionData.transitionTimeAutoPlay = mergeConfigItem(constants.DEFCONF_TRANSITION_TIME_AUTOPLAY,
    null,
    valiInt(iniData.slideshow.transitionTimeAutoPlay));

  actionData.transitionTimeManual = mergeConfigItem(constants.DEFCONF_TRANSITION_TIME_MANUAL,
    null,
    valiInt(iniData.slideshow.transitionTimeManual));

  actionData.timer = mergeConfigItem(constants.DEFCONF_TIMER,
    null,
    valiInt(iniData.slideshow.timer));

  actionData.random = mergeConfigItem(false,
    null,
    valiBoolean(iniData.slideshow.random));

  actionData.detailsPosition = SlideshowReducer.valiDetailsPosition(valiString(iniData.slideshow.detailsPosition));
  actionData.detailsShow = SlideshowReducer.getValidDetailsState(valiString(iniData.slideshow.detailsShow), false);

  actionData.crawlerInfoPosition = SlideshowReducer.valiCrawlerInfoPosition(valiString(iniData.slideshow.crawlerInfoPosition), actionData.detailsPosition);
  actionData.crawlerInfoShow = mergeConfigItem(false, null, valiBoolean(iniData.slideshow.crawlerInfoPosition));

  if (context.tempCliAutoselect) {
    actionData.lastContainerType = constants.CONTAINER_AUTOSELECT;
    actionData.lastContainer = null;
    actionData.lastItem = null;
  } else {
    if (context.tempCliOpenContainer) {
      if (fs.existsSync(actionData.tempCliOpenContainer)) {
        const isDir = fs.lstatSync(context.tempCliOpenContainer).isDirectory();
        actionData.lastContainerType = (isDir ? constants.CONTAINER_FOLDER : constants.CONTAINER_PLAYLIST);
        actionData.lastContainer = context.tempCliOpenContainer;
        actionData.lastItem = null;
      } else {
        log.info(`${_logKey}createSlideshowAction - last file/dir doesn't exist (${context.tempCliOpenContainer})!`);
        actionData.lastContainerType = null;
        actionData.lastContainer = null;
        actionData.lastItem = null;
      }
    } else {
      actionData.lastContainerType = SlideshowReducer.convert2ContainerTypeKey(valiString(iniData.slideshow.lastContainerType));
      actionData.lastContainer = valiString(iniData.slideshow.lastContainer);
      actionData.lastItem = valiString(iniData.slideshow.lastItem);
    }
  }

  actionData.screensaver = !!context.tempCliScreensaver;

  const action = actionsSlideshow.createActionInit(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

export function createSystemAction(iniDataIn, context, defaultLogFile, defaultExifTool) {

  const iniData = iniDataIn;
  if (!iniData.system)
    iniData.system = {};

  const actionData = {};

  actionData.exiftool = defaultExifTool;

  actionData.powerSaveBlockTime = mergeConfigItem(constants.DEFCONF_POWER_SAVE_BLOCK_TIME,
    null,
    valiInt(iniData.system.powerSaveBlockTime));

  // TODO data.system.logfile;

  actionData.logLevelFile = mergeConfigItem(
    !context.isProduction ? "debug" : constants.DEFCONF_LOGLEVEL_CONSOLE,
    null,
    valiLogLevel(iniData.system.logLevelFile));

  actionData.logLevelConsole = mergeConfigItem(constants.DEFCONF_LOGLEVEL_FILE,
    null,
    valiLogLevel(iniData.system.logLevelConsole));

  actionData.logfile = null;
  if (iniData.system.logfile && iniData.system.logfile.trim() === constants.DEFCONF_LOG)
    actionData.logfile = defaultLogFile;
  else if (!actionData.logfile)
    actionData.logfile = iniData.system.logfile;

  const action = actionsSystem.createActionInit(actionData);

  return action;
}

// ----------------------------------------------------------------------------------

