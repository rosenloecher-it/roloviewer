import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./workerIpc"

// ----------------------------------------------------------------------------------

const logKey = "workerOps";

// ----------------------------------------------------------------------------------

export function open(ipcMsg) {

  const { container } = ipcMsg.payload;

  //log.debug(`${logKey}.open:`, container);

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

  const payload = {
    container: folder,
    items: []
  };

  fs.readdirSync(folder).forEach(file => {
    if (path.extname(file).trim().toLowerCase() === ".jpg") {
      const item = {
        file: path.join(folder, file)
      }
      payload.items.push(item);
      //log.debug("openFolder-in", item);
    }
  });

  log.debug(`${logKey}.openFolder: ${folder} (${payload.items.length} items)`);

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
