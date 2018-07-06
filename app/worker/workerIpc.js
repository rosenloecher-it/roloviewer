import log from 'electron-log';
import {electron, remote, ipcRenderer} from 'electron';
import * as constants from "../common/constants";
import config from './workerConfig';
import {WorkerFactory} from "./workerFactory";

// ----------------------------------------------------------------------------------

const _logKey = "workerIpc";
const _ipcMyself = constants.IPC_WORKER;

let _factory = null;
let _dispatcher = null;

// ----------------------------------------------------------------------------------

export function initListener() {
  log.silly(`${_logKey}.initListener`);
  ipcRenderer.on(_ipcMyself, listenWorkerChannel);

  if (constants.DEBUG_IPC_HANDSHAKE)
    testHandshakes();

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
      case constants.ACTION_HANDSHAKE_ANSWER:
        ipcHandshakeAnswer(ipcMsg); return;
      case constants.ACTION_HANDSHAKE_REQUEST:
        ipcHandshakeRequest(ipcMsg); return;

      case constants.ACTION_SHUTDOWN:
        shutdown(ipcMsg); return;
      case constants.ACTION_PUSH_MAIN_CONFIG:
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

function testHandshakes() {
  const func = ".startHandshake";

  setTimeout(() => {
    for (const ipcTarget of [ constants.IPC_MAIN, constants.IPC_RENDERER ]) {
      const payload = Math.floor(1000 * Math.random());
      send(ipcTarget, constants.ACTION_HANDSHAKE_REQUEST, payload);
      log.debug(`${_logKey}${func} - destination=${ipcTarget}; data=`, payload);
    }
  }, 2000)
}

// ----------------------------------------------------------------------------------

function ipcHandshakeAnswer(data) {
  const func = ".ipcHandshakeAnswer";

  if (data.source !== _ipcMyself)
    log.debug(`${_logKey}${func} - destination=${data.destination}; source=${data.source}; data=`, data.payload);
  else
    log.error(`${_logKey}${func} - wrong source - destination=${data.destination}; source=${data.source}; data=`, data.payload);
}

// ----------------------------------------------------------------------------------

function ipcHandshakeRequest(data) {
  const func = ".ipcHandshakeRequest";

  log.debug(`${_logKey}${func} - destination=${data.destination}; source=${data.source}; data=`, data.payload);
  send(data.source, constants.ACTION_HANDSHAKE_ANSWER, data.payload);
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

export function createIpcShowMessage(ipcSource, msgType, msgText) {
  const payload = {
    msgType,
    msgText,
  };

  return createIpcMessage(ipcSource, constants.IPC_RENDERER, constants.ACTION_MSG_ADD, payload);
}

// ----------------------------------------------------------------------------------

export function send(ipcTarget, ipcType, payload) {
  sendRaw(createIpcMessage(_ipcMyself, ipcTarget, ipcType, payload));
}

// ----------------------------------------------------------------------------------

export function sendShowMessage(msgType, msgText) {

  sendRaw(createIpcShowMessage(_ipcMyself, msgType, msgText));

}

// ----------------------------------------------------------------------------------
