import log from 'electron-log';
import {StoreManager} from "../../common/store/storeManager";
import configureStore from "./configureStore";
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "workerManager";

// ----------------------------------------------------------------------------------

export class WorkerManager extends StoreManager {

  constructor() {
    const func = ".constructor";
    super(constants.IPC_WORKER, [constants.IPC_RENDERER, constants.IPC_MAIN ]);

    try {
      this._store = configureStore();
      this._store.dispatch({type: `${_logKey}_init_reducer_type_should_not_exists!(${Math.random()})`});

    } catch (err) {
      log.error(`${_logKey}${func} - creation store failed -`, err);
      throw (err);
    }
  }

  // .....................................................

  shutdown() {
    super.shutdown();

    this._dispatcher = null;
  }

  // ........................................................

  get state() {
    if (this._store)
      return this._store.getState();

    return {};
  }

  // .....................................................

  get dispatcher() { return this._dispatcher; }
  set dispatcher(value){ this._dispatcher = value; }

  // ........................................................

  dispatchLocal(action, invokeHook = false) {
    const func = ".dispatchLocal";

    try {
      super.dispatchLocal(action, invokeHook);

      do {
        if (!this._dispatcher)
          break;
        if (!action)
          break;
        if (!action.type) {
          log.debug(`${_logKey}${func} - action without type!?`, action);
          break;
        }
        if (action.type.indexOf(constants.AR_WORKER_PREFIX) !== 0)
          break;

        this._dispatcher.processTask();

      } while (false);

    } catch (err) {
      log.error(`${_logKey}${func} -`, err);
    }

  }

  // ........................................................

  dispatchTask(action) {

    // do {
    //   if (!action.type) {
    //     log.debug(`${_logKey}${func} - action without type!?`, action);
    //     break;
    //   }
    //   if (action.type.indexOf(constants.AR_WORKER_PREFIX) !== 0)
    //     break;
    //
    //   this.dispatchLocal(action);
    //   return;
    //
    // } while (false);

    this.dispatchGlobal(action);
  }

  // .......................................................

}

// ----------------------------------------------------------------------------------

const _instanceWorkerManager = new WorkerManager();

export default _instanceWorkerManager;
