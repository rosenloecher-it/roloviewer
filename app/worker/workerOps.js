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
    storeManager.sender = ipc;

    if (!_factory) {
      _factory = new Factory(storeManager);
      _factory.loadObjects().then(() => {
        _dispatcher = _factory.getDispatcher();
        if (!_dispatcher)
          throw new Error("no dispatcher!");
        storeManager.dispatcher = _dispatcher;

        ipc.send(constants.IPC_MAIN, constants.AI_CHILD_IS_READY, null);

        return Promise.resolve();

      }).catch((err) => {
        log.error(`${_logKey}${func} - error loading objects - `, err);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} - initialising worker failed! - ${err}`);
      });
    }

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function shutdown() {

  try {
    ipc.unregisterListener();

    _dispatcher = null;
    if (_factory)
      _factory.shutdown();
    _factory = null;
  } catch (err) {
    log.error(`${_logKey}.shutdown - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------
