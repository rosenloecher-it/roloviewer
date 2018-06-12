import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import ini from 'configurable-ini';
import * as appConstants from '../../common/appConstants';
import { mkDirByPathSync } from './configUtils';

//----------------------------------------------------------------------------

export function loadIniFile(file) {
  if (!file) {
    log.info('configIni.loadIniFile: invalid configFile');
    return null;
  }

  if (!fs.existsSync(file)) {
    log.info(`configIni.loadIniFile: file does not exists (${file})`);
    return null;
  }

  const config = ini.parse(fs.readFileSync(file, 'utf-8'));
  //if (config) log.debug('configIni.loadIniFile: ', config);
  return config;
}

//----------------------------------------------------------------------------

export function saveIniFile(file, data) {
  if (!file) {
    log.error('configIni.saveIniFile: invalid configFile');
    return;
  }

  const parentDir = path.dirname(file);
  if (!fs.existsSync(parentDir)) {
    mkDirByPathSync(parentDir);
  }

  if (data) {
    // log.debug('configIni.saveIniFile: ', data);
    fs.writeFileSync(file, ini.stringify(data));
  }
}

//----------------------------------------------------------------------------

// export function test1() {
//   const configPath = getConfigPath();
//   console.log("test1: ", configPath);
//
//   mkDirByPathSync(configPath);
//   const configFileLoad = path.join(configPath, 'load.ini');
//
//   let config;
//
//   if (fs.existsSync(configFileLoad)) {
//     config = ini.parse(fs.readFileSync(configFileLoad, 'utf-8'));
//     console.log('test1: ', config);
//   }
//
//   if (config) {
//
//     console.log("window.window = ", config.window);
//
//
//     console.log("config.window.negative = ", transformInt(config.window.negative));
//     console.log("config.window.negative2 = ", transformInt(config.window.negative2));
//
//     console.log("config.database.user = ", config.database.user);
//
//     console.log("config.paths.datadir = >", config.paths.datadir, "<");
//     config.paths.vals.forEach(function (value) {
//       console.log("config.paths.vals[] = >", value, "<");
//     })
//   }
//
//
//   const configFileWrite = path.join(configPath, 'write.ini');
//   if (fs.existsSync(configFileWrite)) {
//     fs.unlinkSync(configFileWrite);
//   }
//
//   if (config)
//     fs.writeFileSync(configFileWrite, ini.stringify(config));
//
//   console.log("test1: ready");
// }

//----------------------------------------------------------------------------
