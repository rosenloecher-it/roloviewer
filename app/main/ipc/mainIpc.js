import { ipcMain } from 'electron';
import log from 'electron-log';
import * as appConstants from "../../common/appConstants";
import * as windows from '../windows';

// ----------------------------------------------------------------------------------

const logKey = "mainIpc";
const ipcMyself = appConstants.IPC_MAIN;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcMain.on(ipcMyself, listenMainChannel);

  testHandshakes();
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcMain.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, input, output) {
  const func = ".listenMainChannel";

  try {
    //log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);
    //log.debug(`${logKey}.listenMainChannel: input=`, input);

    if (!input || !input.destination || !input.type) {
      log.error(`${logKey}${func} - invalid payload: `, input);
      return;
    }

    if (input.destination === appConstants.IPC_WORKER || input.destination === appConstants.IPC_RENDERER) {
      sendIpcRaw(input);
      return;
    }

    if (input.destination !== ipcMyself) {
      log.error(`${logKey}${func} - invalid destination: `, input);
      return;
    }

    switch (input.type) {
      case appConstants.ACTION_HANDSHAKE_ANSWER:
        ipcHandshakeAnswer(input); break;
      case appConstants.ACTION_HANDSHAKE_REQUEST:
        ipcHandshakeRequest(input); break;
      default:
        log.error(`${logKey}${func} - invalid type: `, input);
        break;
    }

  } catch (err) {
    log.debug(`${logKey}${func} exception:`, err);
  }
}

// ----------------------------------------------------------------------------------

let isHandshakeStarted = false;

function testHandshakes() {

  if (isHandshakeStarted || !appConstants.DEBUG_IPC_HANDSHAKE)
    return;
  isHandshakeStarted = true;

  const func = ".startHandshake";

  setTimeout(() => {
    for (const ipcTarget of [ appConstants.IPC_RENDERER, appConstants.IPC_WORKER ]) {
      const payload = Math.floor(1000 * Math.random());
      sendIpc(ipcTarget, appConstants.ACTION_HANDSHAKE_REQUEST, payload);
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
  sendIpc(data.source, appConstants.ACTION_HANDSHAKE_ANSWER, data.payload);
}

// ----------------------------------------------------------------------------------

function sendIpcRaw(data) {
  const func = ".sendIpcRaw";

  if (!data) {
    log.error(`${logKey}${func} - invalid payload: `);
    return;
  }

  let window = null;
  if (data.destination === appConstants.IPC_WORKER)
    window = windows.getWorkerWindow();
  else if (data.destination === appConstants.IPC_RENDERER)
    window = windows.getMainWindow();

  if (!window) {
    log.error(`${logKey}${func} - invalid destination - `, data);
    return;
  }

  window.webContents.send(data.destination, data);
}

// ----------------------------------------------------------------------------------

function sendIpc(ipcTarget, ipcType, payload) {
  const func = ".sendIpcRaw";

  const data = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload: payload
  };

  sendIpcRaw(data);
}

// ----------------------------------------------------------------------------------
