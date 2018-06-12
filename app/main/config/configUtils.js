import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import * as appConstants from "../../common/appConstants";

// ----------------------------------------------------------------------------------

export function getConfigPath() {
  return path.join(app.getPath('userData'), '..', appConstants.CONFIG_NAME);
}

//----------------------------------------------------------------------------

export function getDefaultConfigPathStd() {
  const configPath = getConfigPath();
  const configFile = path.join(configPath, appConstants.CONFIG_STANDARD);
  return configFile;
}

//----------------------------------------------------------------------------

export function getDefaultConfigPathWin() {
  const configPath = getConfigPath();
  const configFile = path.join(configPath, appConstants.CONFIG_WINDOW);
  return configFile;
}

//----------------------------------------------------------------------------

export function getDefaultCachePath() {
  return path.join(app.getPath('userData'), '..', appConstants.CONFIG_NAME);
}

//----------------------------------------------------------------------------

export function getDefaultCrawlerDb() {
  const configPath = getDefaultCachePath();
  const configFile = path.join(configPath, appConstants.DEFCONF_DBNAME);
  return configFile;
}

//----------------------------------------------------------------------------

export function getDefaultLogFile() {
  const configPath = getDefaultCachePath();
  const configFile = path.join(configPath, appConstants.DEFCONF_LOGNAME);
  return configFile;
}

//----------------------------------------------------------------------------

export function validateInt(input) {

  const num = parseInt(input, 10);

  if (Number.isNaN(num))
    return null;

  return num;
}

// ----------------------------------------------------------------------------------

export function validateBoolean(input) {

  if (input == null)
    return null;
  if (typeof(input) === typeof(true))
    return input;
  const compare = input.toString().trim().toLowerCase();

  if (compare === "true" || compare === "on" || compare === "1")
    return true;
  else if (compare === "false" || compare === "off" || compare === "0")
    return false;

  return null;
}

// ----------------------------------------------------------------------------------

export function validateLogLevel(input) {

  const defaultLogLevel = "warn";

  if (typeof(input) !== typeof("str"))
    return defaultLogLevel;

  const logLevels = [ "error", "warn", "info", "verbose", "debug", "silly" ];

  const output = input.trim().toLowerCase();

  if (logLevels.indexOf(output) > -1)
    return output;

  return defaultLogLevel;
}

// ----------------------------------------------------------------------------------

export function validateStringArray(input) {

  if (!Array.isArray(input))
    return [];

  const output = [];

  for (let text of input) {
    if (typeof(text) === typeof("str")) {
      const value = text.trim().toLowerCase();
      if (!output.includes(value))
        output.push(value);
    }
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function validatePathArray(input) {

  if (!Array.isArray(input))
    return [];

  const output = [];

  for (let text of input) {

    if (typeof(text) !== typeof("str"))
      continue;
    if (!fs.existsSync(text))
      continue;

    if (!output.includes(text))
      output.push(text);
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function validateRatingArray(input) {
  if (!Array.isArray(input))
    return [];

  let output = [];

  for (let text of input) {

    const value = validateInt(text);

    if (typeof(value) != typeof(1))
      continue;
    if (value < 0 || value > 5)
      continue;

    if (!output.includes(value))
      output.push(value);
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function mergeConfigItem(valueDef, valuePrio1, valuePrio2) {

  if (typeof(valueDef) === typeof(valuePrio1))
    return valuePrio1;
  if (typeof(valueDef) === typeof(valuePrio2))
    return valuePrio2;

  return valueDef;
}

// ----------------------------------------------------------------------------------

export function findExifTool(dataFromFile) {

  if (dataFromFile)
    return dataFromFile;
  else
    return "todo-search-fs";
}

// ----------------------------------------------------------------------------------

export function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

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
