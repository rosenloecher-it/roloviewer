import log from 'electron-log';
import * as configIni from "./configIni";
import * as constants from "../../common/constants";
import * as configUtils from "./configUtils";

// ----------------------------------------------------------------------------------

// TODO - check features electron-window-state-manager
//https://github.com/Sethorax/electron-window-state-manager
//https://github.com/Sethorax/electron-window-state-manager/blob/master/src/lib/windowState.js

const logKey = "configWin-";

// ----------------------------------------------------------------------------------

export function loadConfigWindow(fileConfig) {

  let dataFromFile = null;
  try {
    dataFromFile = configIni.loadIniFile(fileConfig);
  } catch (err) {
    log.error(`${logKey}loadConfigWindow (${fileConfig}):`, err);
    dataFromFile = null;
  }

  if (!dataFromFile || !dataFromFile.mainwindow)
    return null;

  const config = {};

  config.x = configUtils.validateInt(dataFromFile.mainwindow.x);
  config.y = configUtils.validateInt(dataFromFile.mainwindow.y);
  config.height = configUtils.validateInt(dataFromFile.mainwindow.height);
  config.width = configUtils.validateInt(dataFromFile.mainwindow.width);

  config.maximized = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.maximized), null);
  config.fullscreen = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.fullscreen), null);
  config.activeDevTools = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.activeDevTools), null);

  return config;
}

// ----------------------------------------------------------------------------------

export function saveConfigWindow(fileConfig, dataApp) {

  try {
    const dataIni = { };
    dataIni.mainwindow = dataApp;

    configIni.saveIniFile(fileConfig, dataIni);
  } catch (err) {
    log.error(`${logKey}saveConfigWindow (${fileConfig}):`, err);
  }
}

// ----------------------------------------------------------------------------------

export function checkConfigWin(config, screenSize) {

  // checks
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

    return true;

  } while (false);

  return false;
}

// ----------------------------------------------------------------------------------

export function getDefaultConfigWin(screenSize)
{
  const config = {};

  config.height = screenSize.height < constants.DEFCONF_HEIGHT_DEF ? screenSize.height : constants.DEFCONF_HEIGHT_DEF;
  config.width = screenSize.width < constants.DEFCONF_WIDTH_DEF ? screenSize.width : constants.DEFCONF_WIDTH_DEF;

  config.x = (screenSize.width - config.width) / 2;
  config.y = (screenSize.height - config.height) / 2;

  config.maximized = false;
  config.fullscreen = false;
  config.activeDevTools = false;

  return config;
}

// ----------------------------------------------------------------------------------

export function setWindowState(configIn, window) {

  const config = configIn; // change by reference

  if (!window || window.isMinimized())
    return;

  config.fullscreen = window.isFullScreen();

  if (!config.fullscreen) {

    config.maximized = window.isMaximized();

    if (!config.maximized) {
      const bounds = window.getBounds();
      config.height = bounds.height;
      config.width = bounds.width;
      config.x = bounds.x;
      config.y = bounds.y;
    }
  }
}

// ----------------------------------------------------------------------------------
