import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import config from "./rendererConfig";
import { _store } from './store/configureStore';
import * as actionsSls from "./store/actionsSlideshow";
import * as actionsMsg from "./store/actionsMessages";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {
  const func = ".init";
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

export function askQuitApp(ipcMsg) {
  const func = ".askQuitApp";

  try {
    //log.silly(`${_logKey}${func} - invoked`);
    const {helpShow} = _store.getState().slideshow;

    if (helpShow)
      _store.dispatch(actionsSls.helpClose());
    else
      ipc.send(constants.IPC_MAIN, constants.ACTION_ESC_CLOSING, null);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function addMessage(ipcMsg) {
  const func = ".addMessage";

  try {
    //log.silly(`${_logKey}${func} - invoked`);
    _store.dispatch(actionsMsg.add(ipcMsg.payload));
  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function helpToogle() {
  const func = ".helpToogle";

  try {
    log.silly(`${_logKey}${func} - invoked`);

    _store.dispatch(actionsSls.helpToogle());

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function detailsToogle() {
  const func = ".detailsToogle";

  try {
    log.silly(`${_logKey}${func} - invoked`);

    _store.dispatch(actionsSls.detailsToogle());

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function detailsMove() {
  const func = ".moveDetails";

  try {
    log.silly(`${_logKey}${func} - invoked`);

    _store.dispatch(actionsSls.detailsMove());

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function newFiles(ipcMsg) {
  const func = ".newFiles";

  try {
    log.debug(`${_logKey}.newFiles: type=${ipcMsg.type}, container=${ipcMsg.payload.container}`);

    const action = actionsSls.newFiles({
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
