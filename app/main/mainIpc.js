import { ipcMain } from 'electron';
import log from 'electron-log';
import * as constants from "../common/constants";
import * as windows from './windows';
import * as ops from "./mainOps";

// ----------------------------------------------------------------------------------

const logKey = "mainIpc";
const ipcMyself = constants.IPC_MAIN;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}.initListener`);
  ipcMain.on(ipcMyself, listenMainChannel);

  if (constants.DEBUG_IPC_HANDSHAKE)
    testHandshakes();
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}.unregisterListener`);
  ipcMain.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, ipcMsg, output) {
  const func = ".listenMainChannel";

  try {
    //log.debug(`${logKey}.listenMainChannel: ipcMsg=`, ipcMsg);

    if (!ipcMsg || !ipcMsg.destination || !ipcMsg.type) {
      log.error(`${logKey}${func} - invalid data: `, ipcMsg);
      return;
    }

    if (ipcMsg.destination === constants.IPC_WORKER || ipcMsg.destination === constants.IPC_RENDERER) {
      sendRaw(ipcMsg);
      return;
    }

    if (ipcMsg.destination !== ipcMyself) {
      log.error(`${logKey}${func} - invalid destination: `, ipcMsg);
      return;
    }

    dispatchMainActions(ipcMsg);

  } catch (err) {
    log.debug(`${logKey}${func} exception:`, err);
  }
}

// ----------------------------------------------------------------------------------

function dispatchMainActions(ipcMsg) {
  const func = ".dispatchMainActions";

  switch (ipcMsg.type) {
    case constants.ACTION_HANDSHAKE_ANSWER:
      ipcHandshakeAnswer(ipcMsg); break;
    case constants.ACTION_HANDSHAKE_REQUEST:
      ipcHandshakeRequest(ipcMsg); break;

    case constants.ACTION_REQUEST_CONFIG:
      ops.initChildConfig(ipcMsg); break;
    case constants.ACTION_READY:
      ops.activateChild(ipcMsg); break;


    case constants.ACTION_SHOW_FILES:
      ops.forwardShowFiles(ipcMsg); break;

    case constants.ACTION_DUMMY_TASK:
      log.info(`${logKey}${func} - ${ipcMsg.type}`); break; // do nothing!

    default:
      log.error(`${logKey}${func} - invalid type: `, ipcMsg);
      break;
  }
}

// ----------------------------------------------------------------------------------

function testHandshakes() {
  const func = ".startHandshake";

  setTimeout(() => {
    for (const ipcTarget of [ constants.IPC_RENDERER, constants.IPC_WORKER ]) {
      const payload = Math.floor(1000 * Math.random());
      send(ipcTarget, constants.ACTION_HANDSHAKE_REQUEST, payload);
      log.debug(`${logKey}${func} - destination=${ipcTarget}; data=`, payload);
    }
  }, 2000)
}

// ----------------------------------------------------------------------------------

function ipcHandshakeAnswer(ipcMsg) {
  const func = ".ipcHandshakeAnswer";

  if (ipcMsg.source !== ipcMyself)
    log.debug(`${logKey}${func} - destination=${ipcMsg.destination}; source=${ipcMsg.source}; data=`, ipcMsg.payload);
  else
    log.error(`${logKey}${func} - wrong source - destination=${ipcMsg.destination}; source=${ipcMsg.source}; data=`, ipcMsg.payload);
}

// ----------------------------------------------------------------------------------

function ipcHandshakeRequest(ipcMsg) {
  const func = ".ipcHandshakeRequest";

  log.debug(`${logKey}${func} - destination=${ipcMsg.destination}; source=${ipcMsg.source}; data=`, ipcMsg.payload);
  send(ipcMsg.source, constants.ACTION_HANDSHAKE_ANSWER, ipcMsg.payload);
}

// ----------------------------------------------------------------------------------

function sendRaw(ipcMsg) {

  const func = ".sendRaw";

  if (!ipcMsg) {
    log.error(`${logKey}${func} - invalid payload: `);
    return;
  }

  let window = null;
  if (ipcMsg.destination === constants.IPC_WORKER)
    window = windows.getWorkerWindow();
  else if (ipcMsg.destination === constants.IPC_RENDERER)
    window = windows.getMainWindow();
  else {
    log.error(`${logKey}${func} - invalid destination - `, ipcMsg);
  }

  if (!window) {
    log.error(`${logKey}${func} - could not find window - `, ipcMsg);
    return;
  }

  window.webContents.send(ipcMsg.destination, ipcMsg);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {

  const ipcMsg = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload
  };

  sendRaw(ipcMsg);
}

// ----------------------------------------------------------------------------------
