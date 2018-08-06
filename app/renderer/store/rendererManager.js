import {StoreManager} from "../../common/store/storeManager";
import * as constants from "../../common/constants";
import { _store } from './configureStore';

// ----------------------------------------------------------------------------------

export class RendererManager extends StoreManager {

  constructor() {
    const func = ".constructor"; // eslint-disable-line no-unused-vars
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

}

// ----------------------------------------------------------------------------------

const _instanceRendererManager = new RendererManager();

export default _instanceRendererManager;
