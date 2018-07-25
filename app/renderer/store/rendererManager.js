import log from 'electron-log';
import {StoreManager} from "../../common/store/storeManager";
import configureStore from "./configureStore";
import * as constants from "../../common/constants";
import { _store } from './configureStore';

// ----------------------------------------------------------------------------------

const _logKey = "rendererManager";

// ----------------------------------------------------------------------------------

export class RendererManager extends StoreManager {

  constructor() {
    const func = ".constructor";
    super(constants.IPC_RENDERER, [constants.IPC_MAIN, constants.IPC_WORKER ]);

    this._store = _store;

  }

  // ........................................................

  get state() {
    if (this._store)
      return this._store.getState();

    return {};
  }

  // .....................................................

  dispatchLocalByRemote(action) {
    super.dispatchLocalByRemote(action);

    // if (action.type === constants.AR_RENDERER_DELIVER_META)
    //   log.debug(`${_logKey}.dispatchLocalByRemote - action:`, action);
  }

}

// ----------------------------------------------------------------------------------

const _instanceRendererManager = new RendererManager();

export default _instanceRendererManager;
