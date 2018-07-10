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

  // ........................................................

  init() {


  }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const _instanceWorkerManager = new WorkerManager();

export default _instanceWorkerManager;
