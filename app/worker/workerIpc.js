import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const logKey = "workerIpc";
const ipcMyself = constants.IPC_WORKER;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcRenderer.on(ipcMyself, listenWorkerChannel);

  if (constants.DEBUG_IPC_HANDSHAKE)
    testHandshakes();

  sendIpc(constants.IPC_MAIN, constants.ACTION_READY, null);
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcRenderer.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenWorkerChannel(event, data, output) {
  const func = ".listenWorkerChannel";

  try {
    //log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);
    //log.debug(`${logKey}.listenMainChannel: input=`, input);

    if (!data || !data.destination || !data.type) {
      log.error(`${logKey}${func} - invalid payload: `, data);
      return;
    }

    if (data.destination !== ipcMyself) {
      log.error(`${logKey}${func} - invalid destination: `, data);
      return;
    }

    dispatchWorkerActions(data);

  } catch (err) {
    log.debug(`${logKey}${func} exception:`, err);

    //ACTION_SHOW_MESSAGE
  }
}

// ----------------------------------------------------------------------------------

function dispatchWorkerActions(data) {
  const func = ".dispatchWorkerActions";

  switch (data.type) {
    case constants.ACTION_HANDSHAKE_ANSWER:
      ipcHandshakeAnswer(data); break;
    case constants.ACTION_HANDSHAKE_REQUEST:
      ipcHandshakeRequest(data); break;

    case constants.ACTION_SETTINGS_TO_CHILD:
      // TODO
      break;

    default:
      log.error(`${logKey}${func} - invalid type: `, data);
      break;
  }
}

// ----------------------------------------------------------------------------------

function testHandshakes() {
  const func = ".startHandshake";

  setTimeout(() => {
    for (const ipcTarget of [ constants.IPC_MAIN, constants.IPC_RENDERER ]) {
      const payload = Math.floor(1000 * Math.random());
      sendIpc(ipcTarget, constants.ACTION_HANDSHAKE_REQUEST, payload);
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
  sendIpc(data.source, constants.ACTION_HANDSHAKE_ANSWER, data.payload);
}

// ----------------------------------------------------------------------------------

function sendIpcRaw(data) {
  const func = ".sendIpcRaw";

  if (!data) {
    log.error(`${logKey}${func} - invalid payload: `);
    return;
  }

  ipcRenderer.send(constants.IPC_MAIN, data);
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
