import electron from 'electron';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import ini from 'configurable-ini';
import * as constants from "../constants";

//----------------------------------------------------------------------------

const _logKey = "fileTools";

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
  const configName = `${constants.APP_BASENAME}${extra}.ini`;
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

export function mkDirWithParents(targetDir) {
  const {sep} = path;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = '.';

  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
      }
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    return curDir;
  }, initDir);
}

// ----------------------------------------------------------------------------------

export function loadIniFile(file) {
  const func = ".loadIniFile";

  if (!file) {
    log.error(`${_logKey}${func}: invalid configFile`);
    return {};
  }

  if (!fs.existsSync(file)) {
    log.info(`${_logKey}${func} - file does not exists (${file})!`);
    return {};
  }

  const config = ini.parse(fs.readFileSync(file, 'utf-8'));
  //if (config) log.debug('${_logKey}${func} ', config);
  return config;
}

//----------------------------------------------------------------------------

export function saveIniFile(file, data) {
  if (!file) {
    log.error(`${_logKey}.saveIniFile: invalid configFile`);
    return;
  }

  const parentDir = path.dirname(file);
  if (!fs.existsSync(parentDir)) {
    mkDirWithParents(parentDir);
  }

  if (data) {
    // log.debug('configIni.saveIniFile: ', data);
    fs.writeFileSync(file, ini.stringify(data));
  }
}

//----------------------------------------------------------------------------

