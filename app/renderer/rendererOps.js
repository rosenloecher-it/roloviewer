import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import config from "./rendererConfig";
import { _store } from './store/configureStore';
import * as actionsSls from "../common/store/slideshowActions";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {
  const func = ".init";

  try {
    log.debug(`${_logKey}${func}`);

    config.importData(ipcMsg.payload);

    ipc.send(constants.IPC_MAIN, constants.ACTION_READY, null);

    if (config.lastAutoPlay)
      _store.dispatch(actionsSls.createActionAutoPlayStart());

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
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
      _store.dispatch(actionsSls.createActionHelpClose());
    else
      ipc.send(constants.IPC_MAIN, constants.ACTION_ESC_CLOSING, null);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function action2Redux(ipcMsg) {
  const func = ".action2Redux";

  let actionType = "???";

  try {
    const action = ipcMsg.payload;
    actionType = action.type;

    //log.debug(`${_logKey}${func}(${actionType}) - in`, ipcMsg);
    _store.dispatch(action);

  } catch (err) {
    log.error(`${_logKey}${func}(${actionType}) - exception -`, err);
    log.error(`${_logKey}${func}(${actionType}) - data -`, ipcMsg);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function triggerOpenItemFolder() {
  const func = ".triggerOpenItemFolder";

  try {

    const { slideshow } = _store.getState();

    do {
      if (slideshow.containerType === constants.CONTAINER_FOLDER)
        break;
      if (0 > slideshow.showIndex || slideshow.items.length <= slideshow.showIndex)
        break;

      const currentFile = slideshow.items[slideshow.showIndex].file;
      const payload = { selectFile: currentFile };

      log.debug(`${_logKey}${func} - constants.ACTION_OPEN -`, payload);

      ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN_ITEM_FOLDER, payload);

    } while (false);
    //

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

export function persistLastItem(lastItemFile, lastContainer) {
  const func = ".persistLastItem";

  try {
    //log.debug(`${_logKey}${func} - lastItem=${lastItemFile}, lastContainer=${lastContainer}`);

    if (lastItemFile) {
      const payload = {
        lastItemFile,
        lastContainer
      }

      ipc.send(constants.IPC_MAIN, constants.ACTION_PERSIST_LAST_ITEM, payload);
    }

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------

export function persistAutoPlay(autoPlay) {
  const func = ".persistAutoPlay";

  try {
    //log.debug(`${_logKey}${func} - autoPlay=${autoPlay}`);

    ipc.send(constants.IPC_MAIN, constants.ACTION_PERSIST_AUTOPLAY, autoPlay);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    // TODO show message
  }
}

// ----------------------------------------------------------------------------------
