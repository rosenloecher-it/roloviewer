import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import config from "./rendererConfig";
import { _store } from './store/configureStore';
import * as actions from "./store/actionsImagePane";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {
  const func = ".init"
  log.debug(`${_logKey}${func}`);

  config.pushMainConfig(ipcMsg.payload);

  ipc.send(constants.IPC_MAIN, constants.ACTION_READY, null);

  log.debug(`${_logKey}${func} - store=<${!_store ? "null" : "not null"}>`);
}

// ----------------------------------------------------------------------------------

export function shutdown(ipcMsg) {
  log.silly(`${_logKey}.shutdown`);

  ipc.unregisterListener();

}

// ----------------------------------------------------------------------------------

export function showMessage(ipcMsg) {

  log.debug(`${_logKey}.showMessage:`);

}

// ----------------------------------------------------------------------------------

export function newFiles(ipcMsg) {
  const func = ".newFiles";

  try {
    log.debug(`${_logKey}.newFiles: type=${ipcMsg.type}, container=${ipcMsg.payload.container}`);

    const action = actions.newFiles({
      type: ipcMsg.type,
      container: ipcMsg.payload.container,
      items: ipcMsg.payload.items
    });

    //log.debug(`${_logKey}.newFiles: action=`, action);

    _store.dispatch(action);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function requestNewItems() {
  const func = ".requestNewItems";

  try {
    ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, null);
    //log.debug(`${_logKey}${func}`);
  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function publishLastItem(lastItemFile, lastContainer) {
  const func = ".publishLastItem";

  try {
    //log.debug(`${_logKey}${func} - lastItem=${lastItemFile}, lastContainer=${lastContainer}`);

    if (lastItemFile) {
      const payload = {
        lastItemFile,
        lastContainer
      }

      ipc.send(constants.IPC_MAIN, constants.ACTION_SET_LAST_ITEM, payload);
    }

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------
