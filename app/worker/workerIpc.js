import log from 'electron-log';
import {electron, remote, ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import * as actionsMsg from "../common/store/messageActions";
import storeManager from "./store/workerManager";
import * as ops from "./workerOps";

// ----------------------------------------------------------------------------------

const _logKey = "workerIpc";
const _ipcMyself = constants.IPC_WORKER;
let _shutdownIpc = false;

// ----------------------------------------------------------------------------------

export function initIpc() {
  //log.debug(`${_logKey}.initIpc`);
  ipcRenderer.on(_ipcMyself, listenWorkerChannel);

  send(constants.IPC_MAIN, constants.AI_CHILD_REQUESTS_CONFIG, null);
}

// ----------------------------------------------------------------------------------

export function shutdownIpc() {
  //log.debug(`${_logKey}.shutdownIpc`);
  _shutdownIpc = true;
  ipcRenderer.removeAllListeners(_ipcMyself);
}

// ----------------------------------------------------------------------------------

function listenWorkerChannel(event, ipcMsg, output) {
  const func = ".listenWorkerChannel";

  try {
    //log.debug(`${_logKey}${func}(${ipcMsg.type})`);

    if (ipcMsg.destination !== _ipcMyself)
      throw new Error(`invalid destination: ${_ipcMyself}`);

    dispatchWorkerActions(ipcMsg);

  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

function dispatchWorkerActions(ipcMsg) {
  const func = ".dispatchWorkerActions";

  switch (ipcMsg.type) {
    case constants.AI_SPREAD_REDUX_ACTION:
      storeManager.dispatchLocalByRemote(ipcMsg.payload); break;

    case constants.AI_MAIN_PUSHED_CONFIG:
      ops.init(ipcMsg); break;
    case constants.AI_SHUTDOWN:
      ops.shutdown(ipcMsg); break;

    case constants.AI_DUMMY:
      log.debug(`${_logKey}${func} - ${ipcMsg.type} from ${ipcMsg.source}`); break;

    default:
      log.error(`${_logKey}${func} - invalid type: `, ipcMsg);
      break;
  }
}

// ----------------------------------------------------------------------------------

function sendRaw(ipcMsg) {
  const func = ".sendRaw";

  if (_shutdownIpc)
    return;

  if (!ipcMsg) {
    log.error(`${_logKey}${func} - invalid ipcMsg (undefined)`);
    return;
  }

  if (ipcMsg.destination === constants.IPC_WORKER) {
    const myself = remote.getCurrentWindow();
    myself.webContents.send(_ipcMyself, ipcMsg);
  } else
    ipcRenderer.send(constants.IPC_MAIN, ipcMsg);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {

  const ipcMsg = {
    type: ipcType,
    source: _ipcMyself,
    destination: ipcTarget,
    payload
  };

  sendRaw(ipcMsg);
}

// ----------------------------------------------------------------------------------

