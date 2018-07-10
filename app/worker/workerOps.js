import log from 'electron-log';
import {WorkerFactory} from "./workerFactory";
import storeManager from "./store/workerManager";
import * as ipc from "./workerIpc";
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "workerOps";

let _factory = null;
let _dispatcher = null;

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {
  const func = ".init";

  //config.importData(ipcMsg.payload);

  // if (!_factory) {
  //   _factory = new WorkerFactory();
  //   _factory.loadObjects().then(() => {
  //     _dispatcher = _factory.getDispatcher();
  //   }).catch((err) => {
  //     log.error(`${_logKey}${func} - error loading objects - `, err);
  //     sendShowMessage(constants.MSG_TYPE_ERROR, "Initialising worker failed!", err);
  //   });
  // }



  try {
    log.debug(`${_logKey}${func}`);

    storeManager.init();

    storeManager.sender = ipc;

    //config.importData(ipcMsg.payload);

    ipc.send(constants.IPC_MAIN, constants.AI_CHILD_IS_READY, null);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function shutdown(ipcMsg) {
  //log.silly(`${_logKey}.shutdown`);

  try {
    ipc.unregisterListener();

    _dispatcher = null;
    if (_factory)
      _factory.shutdownObjects();
    _factory = null;
  } catch (err) {
    log.error(`${_logKey}.shutdown - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------
