import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import configRenderer from './rendererConfig';

// ----------------------------------------------------------------------------------

const logKey = "rendererIpc";
const ipcMyself = constants.IPC_RENDERER;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcRenderer.on(ipcMyself, listenRendererChannel);

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

function listenRendererChannel(event, data, output) {
  const func = ".listenRendererChannel";

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

    dispatchRendererActions(data);

  } catch (err) {
    log.debug(`${logKey}${func} exception:`, err);
  }
}

// ----------------------------------------------------------------------------------

function dispatchRendererActions(data) {
  const func = ".dispatchRendererActions";

  switch (data.type) {
    case constants.ACTION_HANDSHAKE_ANSWER:
      ipcHandshakeAnswer(data); break;
    case constants.ACTION_HANDSHAKE_REQUEST:
      ipcHandshakeRequest(data); break;

    case constants.ACTION_PUSH_MAIN_CONFIG:
      configRenderer.importData(data.payload);
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
    for (const ipcTarget of [ constants.IPC_MAIN, constants.IPC_WORKER ]) {
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

  ipcRenderer.send(constants.IPC_MAIN, data);
}

// ----------------------------------------------------------------------------------

function send(ipcTarget, ipcType, payload) {
  const data = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload: payload
  };

  sendRaw(data);
}

// ----------------------------------------------------------------------------------
