import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import * as ops from "./rendererOps";
import storeManager from "./store/rendererManager";

// ----------------------------------------------------------------------------------

const _logKey = "rendererIpc";
const _ipcMyself = constants.IPC_RENDERER;

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${_logKey}.initListener`);
  ipcRenderer.on(_ipcMyself, listenRendererChannel);

  send(constants.IPC_MAIN, constants.AI_CHILD_REQUESTS_CONFIG, null);
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${_logKey}unregisterListener`);
  ipcRenderer.removeAllListeners(_ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenRendererChannel(event, ipcMsg, output) {
  const func = ".listenRendererChannel";

  try {
    //log.debug(`${_logKey}${func}(${ipcMsg.type})`);

    if (ipcMsg.destination !== _ipcMyself)
      throw new Error(`invalid destination: ${_ipcMyself}`);

    dispatchRendererActions(ipcMsg);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

function dispatchRendererActions(ipcMsg) {
  const func = ".dispatchRendererActions";

  switch (ipcMsg.type) {

    case constants.AI_SPREAD_REDUX_ACTION:
      storeManager.dispatchLocalByRemote(ipcMsg.payload); break;

    case constants.AI_MAIN_PUSHED_CONFIG:
      ops.init(ipcMsg); break;
    case constants.AI_SHUTDOWN:
      ops.shutdown(ipcMsg); break;

    case constants.AI_DUMMY:
      log.debug(`${_logKey}${func} - ${ipcMsg.type} from ${ipcMsg.source}`); break;

    // case constants.ACTION_ESC_CLOSING:
    //    ops.askQuitApp(ipcMsg); break;

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

  ipcRenderer.send(constants.IPC_MAIN, ipcMsg);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {
  const ipcMsg = {
    type: ipcType,
    source: _ipcMyself,
    destination: ipcTarget,
    payload: payload
  };

  sendRaw(ipcMsg);
}

// ----------------------------------------------------------------------------------
