import log from 'electron-log';
import {electron, remote, ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import config from './workerConfig';
import {WorkerFactory} from "./workerFactory";
import * as actionsMsg from "../common/store/messageActions";

// ----------------------------------------------------------------------------------

const _logKey = "workerIpc";
const _ipcMyself = constants.IPC_WORKER;

let _factory = null;
let _dispatcher = null;

// ----------------------------------------------------------------------------------

export function initListener() {
  log.silly(`${_logKey}.initListener`);
  ipcRenderer.on(_ipcMyself, listenWorkerChannel);

  send(constants.IPC_MAIN, constants.ACTION_REQUEST_CONFIG, null);
}

// ----------------------------------------------------------------------------------

function initObjects(ipcMsg) {
  const func = ".initObjects";

  config.importData(ipcMsg.payload);

  if (!_factory) {
    _factory = new WorkerFactory();
    _factory.loadObjects().then(() => {
      _dispatcher = _factory.getDispatcher();
    }).catch((err) => {
      log.error(`${_logKey}${func} - error loading objects - `, err);
      sendShowMessage(constants.MSG_TYPE_ERROR, "Initialising worker failed!", err);
    });
  }
}

// ----------------------------------------------------------------------------------

function shutdown(ipcMsg) {
  //log.debug(`${logKey}.unregisterListener`);
  ipcRenderer.removeAllListeners(_ipcMyself);

  _dispatcher = null;
  if (_factory)
    _factory.shutdownObjects();
  _factory = null;
}

// ----------------------------------------------------------------------------------

function listenWorkerChannel(event, ipcMsg, output) {
  const func = ".listenWorkerChannel";

  try {
    //log.debug("listenWorkerChannel: event=", event, "; data=", data, "; output=", output);
    //log.debug(`${logKey}.listenWorkerChannel: data=`, data);

    if (!ipcMsg || !ipcMsg.destination || !ipcMsg.type) {
      log.error(`${_logKey}${func} - invalid payload: `, ipcMsg);
      return;
    }

    if (ipcMsg.destination !== _ipcMyself) {
      log.error(`${_logKey}${func} - invalid destination: `, ipcMsg);
      return;
    }

    switch (ipcMsg.type) { // eslint-disable-line default-case

      case constants.AI_SHUTDOWN:
        shutdown(ipcMsg); return;
      case constants.AI_PUSH_MAIN_CONFIG:
        initObjects(ipcMsg); return;

    }

    if (_dispatcher) {
      if (_dispatcher.addTask(ipcMsg))
        return; // ipcMsg could be handled
    }

    log.error(`${_logKey}${func} - ipc message cannot be processed: `, ipcMsg);
    sendShowMessage(constants.MSG_TYPE_ERROR, "IPC-Message cannot be processed", ipcMsg);

  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    sendShowMessage(constants.MSG_TYPE_ERROR, "Exception", err);
  }
}

// ----------------------------------------------------------------------------------

function sendRaw(ipcMsg) {
  const func = ".sendRaw";

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

export function createIpcMessage(ipcSource, ipcTarget, ipcType, payload) {
  const ipcMsg = {
    type: ipcType,
    source: ipcSource,
    destination: ipcTarget,
    payload
  };

  return ipcMsg;
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {
  sendRaw(createIpcMessage(_ipcMyself, ipcTarget, ipcType, payload));
}

// ----------------------------------------------------------------------------------

export function sendShowMessage(msgType, msgText) {

  const action = actionsMsg.createActionAddMessage(msgType, msgText);
  send(constants.IPC_RENDERER, constants.AI_SPREAD_REDUX_ACTION, action);

}
