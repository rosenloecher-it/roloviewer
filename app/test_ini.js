import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import ini from 'configurable-ini';
import * as mainConstants from './appConstants';

//----------------------------------------------------------------------------

function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
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

//----------------------------------------------------------------------------

function getConfigPath() {
    return path.join(app.getPath('userData'), '..', mainConstants.APP_NAME);
}

//----------------------------------------------------------------------------

function transformInt(input) {

  const num = parseInt(input);

  if (isNaN(num))
    return null;
  else
    return num;
}

//----------------------------------------------------------------------------

export function test1() {
  const configPath = getConfigPath();
  console.log("test1: ", configPath);

  mkDirByPathSync(configPath);
  const configFileLoad = path.join(configPath, 'load.ini');

  let config;

  if (fs.existsSync(configFileLoad)) {
    config = ini.parse(fs.readFileSync(configFileLoad, 'utf-8'));
    console.log('test1: ', config);
  }

  if (config) {

    console.log("window.window = ", config.window);


    console.log("config.window.negative = ", transformInt(config.window.negative));
    console.log("config.window.negative2 = ", transformInt(config.window.negative2));

    console.log("config.database.user = ", config.database.user);

    console.log("config.paths.datadir = >", config.paths.datadir, "<");
    config.paths.vals.forEach(function (value) {
      console.log("config.paths.vals[] = >", value, "<");
    })
  }


  const configFileWrite = path.join(configPath, 'write.ini');
  if (fs.existsSync(configFileWrite)) {
    fs.unlinkSync(configFileWrite);
  }

  if (config)
    fs.writeFileSync(configFileWrite, ini.stringify(config));

  console.log("test1: ready");
}

//----------------------------------------------------------------------------

export function test2() {
  console.log("test2")

}

//----------------------------------------------------------------------------

