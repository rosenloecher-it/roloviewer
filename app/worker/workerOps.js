import log from 'electron-log';
import {Factory} from "./crawler/factory";
import storeManager from "./store/workerManager";
import * as ipc from "./workerIpc";
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "workerOps";

let _factory = null;
let _dispatcher = null;

// ----------------------------------------------------------------------------------

export function init() {
  const func = ".init";

  try {
    log.debug(`${_logKey}${func}`);

    storeManager.sender = ipc;

    if (!_factory) {
      _factory = new Factory(storeManager);
      _factory.loadObjects().then(() => {
        _dispatcher = _factory.getDispatcher();
        if (!_dispatcher)
          throw new Error("no dispatcher!");
        storeManager.dispatcher = _dispatcher;
      }).catch((err) => {
        log.error(`${_logKey}${func} - error loading objects - `, err);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} - initialising worker failed! - ${err}`);
      });
    }

    ipc.send(constants.IPC_MAIN, constants.AI_CHILD_IS_READY, null);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
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
