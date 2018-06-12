import log from 'electron-log';
import * as configIni from "./configIni";
import * as appConstants from "../common/appConstants";
import * as configUtils from "./configUtils";
import {validateInt} from "./configUtils";

// TODO - check features electron-window-state-manager
//https://github.com/Sethorax/electron-window-state-manager
//https://github.com/Sethorax/electron-window-state-manager/blob/master/src/lib/windowState.js

// ----------------------------------------------------------------------------------

export function loadConfigWindow(fileConfig) {

  let dataFromFile = null;
  try {
    log.verbose("configWin.loadConfigWindow: going to load windows config: " + fileConfig);
    dataFromFile = configIni.loadIniFile(fileConfig);
  } catch (err) {
    log.error("configWin.loadConfigWindow: (" + fileConfig + "): ", err)
    dataFromFile = null;
  }

  if (dataFromFile && dataFromFile.mainwindow) {
    const config = {};

    config.x = configUtils.validateInt(dataFromFile.mainwindow.x);
    config.y = configUtils.validateInt(dataFromFile.mainwindow.y);
    config.height = configUtils.validateInt(dataFromFile.mainwindow.height);
    config.width = configUtils.validateInt(dataFromFile.mainwindow.width);

    config.maximized = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.maximized), null);
    config.fullscreen = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.fullscreen), null);
    config.activeDevTools = configUtils.mergeConfigItem(false, configUtils.validateBoolean(dataFromFile.mainwindow.activeDevTools), null);

    return config;
  } else {
    return null;
  }
}

// ----------------------------------------------------------------------------------

export function saveConfigWindow(fileConfig, dataApp) {

  try {
    log.verbose("configWin.saveConfigWindow: going to save windows config: " + fileConfig);

    const dataIni = { };
    dataIni.mainwindow = dataApp;

    configIni.saveIniFile(fileConfig, dataIni);
  } catch (err) {
    log.error("configWin.saveConfigWindow: (" + fileConfig + "): ", err)
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
    if (!config.height || config.height < appConstants.SIZE_HEIGHT_DEF || config.height > screenSize.height)
      break;
    if (!config.width || config.width < appConstants.SIZE_WIDTH_DEF || config.width > screenSize.width)
      break;

    return true;

  } while (false);

  return false;
}

// ----------------------------------------------------------------------------------

export function getDefaultConfigWin(screenSize)
{
  const config = {};

  config.height = screenSize.height < appConstants.SIZE_HEIGHT_DEF ? screenSize.height : appConstants.SIZE_HEIGHT_DEF;
  config.width = screenSize.width < appConstants.SIZE_WIDTH_DEF ? screenSize.width : appConstants.SIZE_WIDTH_DEF;

  config.x = (screenSize.width - config.width) / 2;
  config.y = (screenSize.height - config.height) / 2;

  config.maximized = false;
  config.fullscreen = false;
  config.activeDevTools = false;

  return config;
}

// ----------------------------------------------------------------------------------

export function setWindowState(config, window) {

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
