import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import config from './rendererConfig';
import * as ops from "./rendererOps";

// ----------------------------------------------------------------------------------

const _logKey = "rendererIpc";
const ipcMyself = constants.IPC_RENDERER;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcRenderer.on(ipcMyself, listenRendererChannel);

  if (constants.DEBUG_IPC_HANDSHAKE)
    testHandshakes();

  send(constants.IPC_MAIN, constants.ACTION_REQUEST_CONFIG, null);
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcRenderer.removeAllListeners(ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenRendererChannel(event, ipcMsg, output) {
  const func = ".listenRendererChannel";

  try {
    //log.debug(`${logKey}.listenRendererChannel: data=`, ipcMsg.payload);

    if (!ipcMsg || !ipcMsg.destination || !ipcMsg.type) {
      log.error(`${_logKey}${func} - invalid payload: `, ipcMsg);
      return;
    }

    if (ipcMsg.destination !== ipcMyself) {
      log.error(`${_logKey}${func} - invalid destination: `, ipcMsg);
      return;
    }

    dispatchRendererActions(ipcMsg);

  } catch (err) {
    log.debug(`${_logKey}${func} exception:`, err);
  }
}

// ----------------------------------------------------------------------------------

function dispatchRendererActions(ipcMsg) {
  const func = ".dispatchRendererActions";

  try {
    switch (ipcMsg.type) {
      case constants.ACTION_HANDSHAKE_ANSWER:
        ipcHandshakeAnswer(ipcMsg); break;
      case constants.ACTION_HANDSHAKE_REQUEST:
        ipcHandshakeRequest(ipcMsg); break;

      case constants.ACTION_SHUTDOWN:
        ops.shutdown(ipcMsg); break;
      case constants.ACTION_PUSH_MAIN_CONFIG:
        ops.init(ipcMsg); break;

      case constants.ACTION_SHOW_MESSAGE:
        ops.showMessage(ipcMsg); break;
      case constants.ACTION_SHOW_FILES:
      case constants.ACTION_ADD_FILES:
        ops.newFiles(ipcMsg); break;

      case constants.ACTION_HELP_TOOGLE:
        ops.toogleHelp(ipcMsg); break;

      default:
        log.error(`${_logKey}${func} - invalid type: `, ipcMsg);
        break;
    }
  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

function testHandshakes() {
  const func = ".startHandshake";

  setTimeout(() => {
    for (const ipcTarget of [ constants.IPC_MAIN, constants.IPC_WORKER ]) {
      const payload = Math.floor(1000 * Math.random());
      send(ipcTarget, constants.ACTION_HANDSHAKE_REQUEST, payload);
      log.debug(`${_logKey}${func} - destination=${ipcTarget}; data=`, payload);
    }
  }, 2000)
}

// ----------------------------------------------------------------------------------

function ipcHandshakeAnswer(ipcMsg) {
  const func = ".ipcHandshakeAnswer";

  if (ipcMsg.source !== ipcMyself)
    log.debug(`${_logKey}${func} - destination=${ipcMsg.destination}; source=${ipcMsg.source}; data=`, ipcMsg.payload);
  else
    log.error(`${_logKey}${func} - wrong source - destination=${ipcMsg.destination}; source=${ipcMsg.source}; data=`, ipcMsg.payload);
}

// ----------------------------------------------------------------------------------

function ipcHandshakeRequest(ipcMsg) {
  const func = ".ipcHandshakeRequest";

  log.debug(`${_logKey}${func} - destination=${ipcMsg.destination}; source=${ipcMsg.source}; data=`, ipcMsg.payload);
  send(ipcMsg.source, constants.ACTION_HANDSHAKE_ANSWER, ipcMsg.payload);
}

// ----------------------------------------------------------------------------------

function sendRaw(ipcMsg) {
  const func = ".sendRaw";

  if (!ipcMsg) {
    log.error(`${_logKey}${func} - invalid payload: `);
    return;
  }

  ipcRenderer.send(constants.IPC_MAIN, ipcMsg);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {
  const ipcMsg = {
    type: ipcType,
    source: ipcMyself,
    destination: ipcTarget,
    payload: payload
  };

  sendRaw(ipcMsg);
}

// ----------------------------------------------------------------------------------
