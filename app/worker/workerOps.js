import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { ExifTool } from 'exiftool-vendored';
//import exiftoolLoader from 'node-exiftool';
import exifreader from 'exifreader';
import * as constants from "../common/constants";
import * as ipc from "./workerIpc"
import config from "../worker/workerConfig";

// ----------------------------------------------------------------------------------

const logKey = "workerOps";

let _exiftoolInitialized = false;
let _exiftool = null;

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {

  log.debug(`${logKey}.init`);

  config.importData(ipcMsg.payload);

  initExifTool();

}

// ----------------------------------------------------------------------------------

export function shutdown(ipcMsg) {

  ipc.unregisterListener();

  if (_exiftool)
    _exiftool.end();
  _exiftool = null;

  log.debug(`${logKey}.shutdown`);
}

// ----------------------------------------------------------------------------------

function initExifTool() {
  if (_exiftoolInitialized)
    return;
  _exiftoolInitialized = true;

  const func = '.initExifTool';

  if (_exiftool)
    return;

  let exiftool = null;

  try {
    const exiftoolPath = config.getExifToolPath();

    if (exiftoolPath && fs.existsSync(exiftoolPath)) {

      const maxProcs = void(0);
      const maxTasksPerProcess = void(0);
      const spawnTimeoutMillis = void(0);
      const taskTimeoutMillis = void(0);
      const onIdleIntervalMillis = void(0);
      const taskRetries = void(0);
      const batchClusterOpts = void(0);
      //const exiftoolPath = '/usr/bin/exiftool';

      exiftool = new ExifTool(maxProcs, maxTasksPerProcess, spawnTimeoutMillis, taskTimeoutMillis, onIdleIntervalMillis, taskRetries, batchClusterOpts
                                , exiftoolPath);
      log.info(`${logKey}${func} - path ${exiftoolPath}`);
    } else {
      exiftool = new ExifTool();
      log.info(`${logKey}${func} - without path!`);
    }

    exiftool.version()
      .then(version => { log.info(`${logKey}${func} - success - ExifTool v${version}`); _exiftool = exiftool; })
      .catch(err => { log.error(`${logKey}${func} - failed`, err); _exiftool = null; } );

  } catch (err) {
    log.error(`${logKey}${func} - exception:`, err);
    exiftool = null;
  }

  return exiftool;
}

// ----------------------------------------------------------------------------------

export function open(ipcMsg) {

  const { container } = ipcMsg.payload;

  log.debug(`${logKey}.open:`, container);

  if (container) {

    if (fs.lstatSync(container).isDirectory())
      openFolder(container);
    else if (fs.lstatSync(container).isFile())
      openPlayList(container);
  } else {
    openAutoSelect();
  }

}

// ----------------------------------------------------------------------------------

function openPlayList(playlist) {

  log.debug(`${logKey}.openPlayList: ${playlist}`);
  // TODO
  showMessage(constants.MSG_TYPE_ERROR, constants.ERROR_NOT_IMPLEMENTED);
}

// ----------------------------------------------------------------------------------

function openFolder(folder) {

  const func = ".openFolder";

  const payload = {
    container: folder,
    items: []
  };

  log.debug(`${logKey}${func}: in ${folder}`);

  fs.readdirSync(folder).forEach(file => {
    if (path.extname(file).trim().toLowerCase() === ".jpg") {
      const item = loadFile(path.join(folder, file));
      payload.items.push(item);
      //log.debug("openFolder-in", item);
    }
  });

  log.debug(`${logKey}${func}: out - (${payload.items.length} items)`);

  ipc.send(constants.IPC_MAIN, constants.ACTION_SHOW_FILES, payload);
}

// ----------------------------------------------------------------------------------

function openAutoSelect() {
  // TODO
  showMessage(constants.MSG_TYPE_ERROR, constants.ERROR_NOT_IMPLEMENTED);
}

// ----------------------------------------------------------------------------------

export function showMessage(msgType, msgText) {

  const payload = {
    msgType,
    msgText
  };

  ipc.send(constants.IPC_RENDERER, constants.ACTION_SHOW_MESSAGE, payload);

}

// ----------------------------------------------------------------------------------

function loadFile(file) {
  const func = ".loadFile";

  // log.debug(`${logKey}${func}: in - ${file}`);
  const item = {
    file: file
  };

  extractAndStoreMetaData(file);

  return item;
}

// ----------------------------------------------------------------------------------

function extractAndStoreMetaData(file) {
  const func = ".extractAndStoreMetaData";

  return;


  if (_exiftool) {
    _exiftool
      .read(file)
      .then((tags /*: Tags */) => log.info(`${logKey}${func} - ${file}: Model: ${tags.Model}, Errors: ${tags.errors}`, tags))
      .catch(err => log.error(`${logKey}${func} - ${file}:`, err));

    //log.info(`${logKey}${func} - ${file} - out`);


  } else
    log.info(`${logKey}${func} - _exiftool == null`);
}

// ----------------------------------------------------------------------------------

function showTag(file, tags, tagName) {

  const tag = tags[tagName];
  if (tag && tag.description)
    log.info(`${file}: ${tagName}=`, tag.description);
  else {
    log.error(`${file}: no decription - ${tagName}=`, tag);
  }
}

// ----------------------------------------------------------------------------------

function extractAndStoreMetaData2(file) {
  const func = ".extractAndStoreMetaData2";

  try {

    //fs.readFile(file, function (err, data) {

    const data = fs.readFileSync(file);

    const tags = exifreader.load(data.buffer);

    // The MakerNote tag can be really large. Remove it to lower memory
    // usage if you're parsing a lot of files and saving the tags.

    showTag(file, tags, "Model");
    showTag(file, tags, "LensModel");
    showTag(file, tags, "ShutterSpeedValue");
    showTag(file, tags, "ApertureValue");
    showTag(file, tags, "FocalLengthIn35mmFilm");
    showTag(file, tags, "Flash");

    log.info(`${file}: ${tagName}=`, tags);


  } catch (err) {
    log.error(`${logKey}${func} - ${file} - exception`, err);
  }

}


// ----------------------------------------------------------------------------------
