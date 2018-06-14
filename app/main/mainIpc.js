import { ipcMain } from 'electron';
import log from 'electron-log';
import * as constants from "../common/constants";
import * as windows from './windows';
import * as operations from "./mainOperations";

// ----------------------------------------------------------------------------------

const logKey = "mainIpc";
const ipcMyself = constants.IPC_MAIN;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcMain.on(ipcMyself, listenMainChannel);

  if (constants.DEBUG_IPC_HANDSHAKE)
    testHandshakes();
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcMain.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, data, output) {
  const func = ".listenMainChannel";

  try {
    //log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);
    //log.debug(`${logKey}.listenMainChannel: input=`, input);

    if (!data || !data.destination || !data.type) {
      log.error(`${logKey}${func} - invalid data: `, data);
      return;
    }

    if (data.destination === constants.IPC_WORKER || data.destination === constants.IPC_RENDERER) {
      sendRaw(data);
      return;
    }

    if (data.destination !== ipcMyself) {
      log.error(`${logKey}${func} - invalid destination: `, data);
      return;
    }

    dispatchMainActions(data);

  } catch (err) {
    log.debug(`${logKey}${func} exception:`, err);
  }
}

// ----------------------------------------------------------------------------------

function dispatchMainActions(data) {
  const func = ".dispatchMainActions";

  switch (data.type) {
    case constants.ACTION_HANDSHAKE_ANSWER:
      ipcHandshakeAnswer(data); break;
    case constants.ACTION_HANDSHAKE_REQUEST:
      ipcHandshakeRequest(data); break;

    case constants.ACTION_READY: // fall through
      operations.initChild(data.source); break;


    default:
      log.error(`${logKey}${func} - invalid type: `, data);
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

function ipcHandshakeAnswer(data) {
  const func = ".ipcHandshakeAnswer";

  if (data.source !== ipcMyself)
    log.debug(`${logKey}${func} - destination=${data.destination}; source=${data.source}; data=`, data.payload);
  else
    log.error(`${logKey}${func} - wrong source - destination=${data.destination}; source=${data.source}; data=`, data.payload);
}

// ----------------------------------------------------------------------------------

function ipcHandshakeRequest(data) {
  const func = ".ipcHandshakeRequest";

  log.debug(`${logKey}${func} - destination=${data.destination}; source=${data.source}; data=`, data.payload);
  send(data.source, constants.ACTION_HANDSHAKE_ANSWER, data.payload);
}

// ----------------------------------------------------------------------------------

function sendRaw(data) {

  const func = ".sendRaw";

  if (!data) {
    log.error(`${logKey}${func} - invalid payload: `);
    return;
  }

  let window = null;
  if (data.destination === constants.IPC_WORKER)
    window = windows.getWorkerWindow();
  else if (data.destination === constants.IPC_RENDERER)
    window = windows.getMainWindow();

  if (!window) {
    log.error(`${logKey}${func} - invalid destination - `, data);
    return;
  }

  window.webContents.send(data.destination, data);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {

  const data = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload
  };

  sendRaw(data);
}

// ----------------------------------------------------------------------------------
