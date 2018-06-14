import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import config from "./rendererConfig";
import { store } from './store/configureStore';
import * as actions from "./store/actionsImagePane";

// ----------------------------------------------------------------------------------

const logKey = "rendererOps";

// ----------------------------------------------------------------------------------

export function showMessage(ipcMsg) {

  log.debug(`${logKey}.showMessage:`);

}

// ----------------------------------------------------------------------------------

export function showFiles(ipcMsg) {

  log.debug(`${logKey}.showFiles`);

  const action = actions.showFiles(ipcMsg.payload);

  //log.debug(`${logKey}.showFiles`, action);

  store.dispatch(action);
}

// ----------------------------------------------------------------------------------
