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
    } catch (err) {
      log.error(`${_logKey}${func} - creation store failed -`, err);
      throw (err);
    }
    if (!this._store)
      throw new Error(`${_logKey}${func} - cannot create store!`);
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

      switch (action.type) {
        case constants.AR_CRAWLER_T1_OPEN:
          if (!this._dispatcher)
            throw new Error("no dispatcher!")

          this._dispatcher.processTask();
          break;

        default:
          break; // do nothing
      }


    } catch (err) {
      log.debug(`${_logKey}${func} - failed`, err);
      throw (err);
    }

  }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const _instanceWorkerManager = new WorkerManager();

export default _instanceWorkerManager;
