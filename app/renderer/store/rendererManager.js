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

}

// ----------------------------------------------------------------------------------

const _instanceRendererManager = new RendererManager();

export default _instanceRendererManager;
