import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import config from './workerConfig';
import * as ops from "./workerOps";

// ----------------------------------------------------------------------------------

const logKey = "ipc";
const ipcMyself = constants.IPC_WORKER;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcRenderer.on(ipcMyself, listenWorkerChannel);

  if (constants.DEBUG_IPC_HANDSHAKE)
    testHandshakes();

  send(constants.IPC_MAIN, constants.ACTION_READY, null);
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcRenderer.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenWorkerChannel(event, ipcMsg, output) {
  const func = ".listenWorkerChannel";

  try {
    //log.debug("listenWorkerChannel: event=", event, "; data=", data, "; output=", output);
    //log.debug(`${logKey}.listenWorkerChannel: data=`, data);

    if (!ipcMsg || !ipcMsg.destination || !ipcMsg.type) {
      log.error(`${logKey}${func} - invalid payload: `, ipcMsg);
      return;
    }

    if (ipcMsg.destination !== ipcMyself) {
      log.error(`${logKey}${func} - invalid destination: `, ipcMsg);
      return;
    }

    dispatchWorkerActions(ipcMsg);

  } catch (err) {
    log.debug(`${logKey}${func} exception:`, err);

    //ACTION_SHOW_MESSAGE
  }
}

// ----------------------------------------------------------------------------------

function dispatchWorkerActions(ipcMsg) {
  const func = ".dispatchWorkerActions";

  switch (ipcMsg.type) {
    case constants.ACTION_HANDSHAKE_ANSWER:
      ipcHandshakeAnswer(ipcMsg); break;
    case constants.ACTION_HANDSHAKE_REQUEST:
      ipcHandshakeRequest(ipcMsg); break;

    case constants.ACTION_SHUTDOWN:
      ops.shutdown(ipcMsg); break;
    case constants.ACTION_PUSH_MAIN_CONFIG:
      ops.init(ipcMsg); break;

    case constants.ACTION_OPEN:
      ops.open(ipcMsg);
      break;

    default:
      log.error(`${logKey}${func} - invalid type: `, ipcMsg);
      break;
  }
}

// ----------------------------------------------------------------------------------

function testHandshakes() {
  const func = ".startHandshake";

  setTimeout(() => {
    for (const ipcTarget of [ constants.IPC_MAIN, constants.IPC_RENDERER ]) {
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

function sendRaw(ipcMsg) {
  const func = ".sendRaw";

  if (!ipcMsg) {
    log.error(`${logKey}${func} - invalid ipcMsg (undefined)`);
    return;
  }

  ipcRenderer.send(constants.IPC_MAIN, ipcMsg);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {
  const data = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload: payload
  };

  sendRaw(data);
}

// ----------------------------------------------------------------------------------
