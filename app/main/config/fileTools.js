import electron from 'electron';
import fs from 'fs';
import path from 'path';
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

export function getConfigPath() {
  return path.join(electron.app.getPath('userData'), '..', constants.CONFIG_NAME);
}

//----------------------------------------------------------------------------

export function getDefaultCachePath() {
  return path.join(electron.app.getPath('userData'), '..', constants.CONFIG_NAME);
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

export function getDefaultConfigFile(isProduction) {

  const extra = (isProduction ? "" : "_test");
  const configPath = getConfigPath();
  const configName = `${constants.CONFIG_BASENAME}${extra}.ini`;
  const defaultConfigFile = path.join(configPath, configName);
  return defaultConfigFile;
}

//----------------------------------------------------------------------------

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



