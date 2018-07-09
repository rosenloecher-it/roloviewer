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
      case constants.AI_SHUTDOWN:
        ops.shutdown(ipcMsg); break;
      case constants.AI_PUSH_MAIN_CONFIG:
        ops.init(ipcMsg); break;

      case constants.AI_SPREAD_REDUX_ACTION:
        ops.action2Redux(ipcMsg); break;

      case constants.ACTION_OPEN_ITEM_FOLDER:
        ops.triggerOpenItemFolder(ipcMsg); break;

      case constants.ACTION_ESC_CLOSING:
         ops.askQuitApp(ipcMsg); break;

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
