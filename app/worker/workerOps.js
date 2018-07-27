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
  const func = '.shutdown';

  try {
    const currentDispatcher = _dispatcher;
    const currentFactory = _factory;

    _dispatcher = null;
    _factory = null;

    if (currentDispatcher)
      currentDispatcher.stopProcessing();

    if (currentFactory) {
      // get behind all other running operations (promise chains with mutiple steps)
      // using setImmediate, you need several nested calls!
      setTimeout(() => {
        currentFactory.shutdown().then(() => {
          log.debug(`${_logKey}${func}.promise - factory is down`);
          return Promise.resolve();

        }).catch((err) => {
          log.error(`${_logKey}${func}.promise.catch -`, err);
          return Promise.resolve();

        }).then(() => {
          // finally
          ipc.send(constants.IPC_MAIN, constants.AI_QUIT_APP_BY_WORKER);
          ipc.shutdownIpc();
          log.debug(`${_logKey}${func}.promise.finally - ipc is down`);
          return Promise.resolve();

        }).catch((err) => {
          log.error(`${_logKey}${func}.promise.finally.catch -`, err);
        })

      }, 50);
    }

    //

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
  }
}

// ----------------------------------------------------------------------------------
