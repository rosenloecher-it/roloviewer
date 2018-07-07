import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

export function getConfigPath() {
  return path.join(app.getPath('userData'), '..', constants.CONFIG_NAME);
}

//----------------------------------------------------------------------------

export function getDefaultCachePath() {
  return path.join(app.getPath('userData'), '..', constants.CONFIG_NAME);
}

//----------------------------------------------------------------------------

export function getDefaultCrawlerDb() {
  const configPath = getDefaultCachePath();
  const configFile = path.join(configPath, constants.DEFCONF_DBNAME);
  return configFile;
}

//----------------------------------------------------------------------------

export function getDefaultLogFile() {
  const configPath = getDefaultCachePath();
  const configFile = path.join(configPath, constants.DEFCONF_LOGNAME);
  return configFile;
}

//----------------------------------------------------------------------------

export function mergeConfigItem(valueDef, valuePrio1, valuePrio2) {

  if (typeof(valueDef) === typeof(valuePrio1))
    return valuePrio1;
  if (typeof(valueDef) === typeof(valuePrio2))
    return valuePrio2;

  return valueDef;
}

// ----------------------------------------------------------------------------------

export function mergeStringItem(valueDef, valuePrio1, valuePrio2) {

  if (typeof("str") === typeof(valuePrio1) && valuePrio1 !== "undefined")
    return valuePrio1;
  if (typeof("str") === typeof(valuePrio2) && valuePrio2 !== "undefined")
    return valuePrio2;

  return valueDef;
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

export function findExifTool(pathFromFile) {
  if (!pathFromFile && typeof(pathFromFile) === typeof("s"))
    return pathFromFile;

  const defPath = '/usr/bin/exiftool';

  // TODO
  if (fs.existsSync(defPath))
    return defPath;

  return null;

}

// ----------------------------------------------------------------------------------

export function mkDirByPathSync(targetDir) {
  const {sep} = path;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = '.';

  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
        console.log(`Directory ${curDir} created!`);
      }
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }

      console.log(`Directory ${curDir} already exists!`);
    }

    return curDir;
  }, initDir);
}

// ----------------------------------------------------------------------------------

