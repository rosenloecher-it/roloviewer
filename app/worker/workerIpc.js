import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as appConstants from "../common/appConstants";

// ----------------------------------------------------------------------------------

const logKey = "workerIpc";
const ipcMyself = appConstants.IPC_WORKER;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcRenderer.on(ipcMyself, listenWorkerChannel);

  testHandshakes();
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcRenderer.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenWorkerChannel(event, input, output) {
  const func = ".listenWorkerChannel";

  try {
    //log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);
    //log.debug(`${logKey}.listenMainChannel: input=`, input);

    if (!input || !input.destination || !input.type) {
      log.error(`${logKey}${func} - invalid payload: `, input);
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
    for (const ipcTarget of [ appConstants.IPC_MAIN, appConstants.IPC_RENDERER ]) {
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

  ipcRenderer.send(appConstants.IPC_MAIN, data);
}

// ----------------------------------------------------------------------------------

function sendIpc(ipcTarget, ipcType, payload) {
  const data = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload: payload
  };

  sendIpcRaw(data);
}

// ----------------------------------------------------------------------------------
