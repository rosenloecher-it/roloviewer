import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import { _store } from './store/configureStore';
import * as actionsSls from "../common/store/slideshowActions";
import storeManager from "./store/rendererManager";
import * as actionsCrawler from "../common/store/crawlerActions";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {
  const func = ".init";

  try {
    log.debug(`${_logKey}${func}`);

    storeManager.sender = ipc;

    ipc.send(constants.IPC_MAIN, constants.AI_CHILD_IS_READY, null);

    // if (config.lastAutoPlay)
    //   _store.dispatch(actionsSlideshow.createActionAutoPlayStart());

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function shutdown(ipcMsg) {
  //log.silly(`${_logKey}.shutdown`);

  try {
    ipc.unregisterListener();
  } catch (err) {
    log.error(`${_logKey}.shutdown - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {
  //log.silly(`${_logKey}.shutdown`);

  try {
    ipc.send(constants.IPC_MAIN, constants.AI_TOOGLE_FULLSCREEN)
  } catch (err) {
    log.error(`${_logKey}.toogleFullscreen - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------
