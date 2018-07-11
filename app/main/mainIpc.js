import { ipcMain } from 'electron';
import log from 'electron-log';
import * as constants from "../common/constants";
import * as windows from './windows';
import * as ops from "./mainOps";
import * as actionsMsg from "../common/store/messageActions";
import storeManager from './store/mainManager';
import {quitApp} from "./mainOps";

// ----------------------------------------------------------------------------------

const _logKey = "mainIpc";
const _ipcMyself = constants.IPC_MAIN;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${_logKey}.initListener`);
  ipcMain.on(_ipcMyself, listenMainChannel);
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${_logKey}.unregisterListener`);
  ipcMain.removeAllListeners(_ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, ipcMsg, output) {
  const func = ".listenMainChannel";

  try {
    //log.debug(`${_logKey}.listenMainChannel: ipcMsg=`, ipcMsg);

    if (ipcMsg.destination === constants.IPC_WORKER || ipcMsg.destination === constants.IPC_RENDERER) {
      sendRaw(ipcMsg);
      return;
    }

    if (ipcMsg.destination !== _ipcMyself) {
      log.error(`${_logKey}${func} - invalid destination: >>${_ipcMyself}<<`, ipcMsg);
      throw new Error(`invalid destination!`);
    }

    dispatchMainActions(ipcMsg);

  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
  }
}

// ----------------------------------------------------------------------------------

function dispatchMainActions(ipcMsg) {
  const func = ".dispatchMainActions";

  switch (ipcMsg.type) {

    case constants.AI_DUMMY:
      log.debug(`${_logKey}${func} - ${ipcMsg.type} from ${ipcMsg.source}`); break;

    case constants.AI_SPREAD_REDUX_ACTION:
      storeManager.dispatchLocalByRemote(ipcMsg.payload); break;

    case constants.AI_CHILD_REQUESTS_CONFIG:
      ops.initChildConfig(ipcMsg); break;
    case constants.AI_CHILD_IS_READY:
      ops.activateChild(ipcMsg); break;

    case constants.AI_TOOGLE_FULLSCREEN:
      ops.toogleFullscreen(); break;
    case constants.AI_QUIT_SCREENSAVER:
      ops.quitApp(); break;


    default:
      log.error(`${_logKey}${func} - invalid type: `, ipcMsg);
      break;
  }
}

// ----------------------------------------------------------------------------------

function sendRaw(ipcMsg) {

  const func = ".sendRaw";

  if (!ipcMsg) {
    log.error(`${_logKey}${func} - invalid payload: `);
    return;
  }

  let window = null;
  if (ipcMsg.destination === constants.IPC_WORKER)
    window = windows.getWorkerWindow();
  else if (ipcMsg.destination === constants.IPC_RENDERER)
    window = windows.getMainWindow();
  else {
    log.error(`${_logKey}${func} - invalid destination - `, ipcMsg);
  }

  if (!window) {
    log.error(`${_logKey}${func} - could not find window - `, ipcMsg);
    return;
  }

  window.webContents.send(ipcMsg.destination, ipcMsg);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {

  const ipcMsg = {
    type: ipcType,
    source: _ipcMyself,
    destination: ipcTarget,
    payload
  };

  sendRaw(ipcMsg);
}

// ----------------------------------------------------------------------------------

