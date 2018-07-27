import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import storeManager from "./store/rendererManager";
import * as rendererActions from "../common/store/rendererActions";
import {RendererReducer} from "../common/store/rendererReducer";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";
const _rolloverFlickerTime = 300;

// ----------------------------------------------------------------------------------

export function init(ipcMsg) {
  const func = ".init";

  try {
    storeManager.sender = ipc;

    ipc.send(constants.IPC_MAIN, constants.AI_CHILD_IS_READY, null);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function shutdown(ipcMsg) {

  try {
    ipc.shutdownIpc();
  } catch (err) {
    log.error(`${_logKey}.shutdown - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {

  try {
    ipc.send(constants.IPC_MAIN, constants.AI_TOOGLE_FULLSCREEN);
  } catch (err) {
    log.error(`${_logKey}.toogleFullscreen - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function quitScreensaver() {
  try {
    ipc.send(constants.IPC_MAIN, constants.AI_QUITTING_SCREENSAVER_MODE);
    log.debug(`${_logKey}.quitScreensaver send`);
  } catch (err) {
    log.error(`${_logKey}.quitScreensaver - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function openUrl(url) {

  try {
    log.debug(`${_logKey}.openUrl: ${url}`);

    require('electron').remote.shell.openExternal(url);

  } catch (err) {
    log.error(`${_logKey}.openUrl - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function isAutoPlay() {
  const func = '.isAutoPlay';

  try {
    const slideshowState = storeManager.slideshowState;
    const contextState = storeManager.contextState;

    return slideshowState.autoPlay || contextState.isScreensaver;

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
    return null;
  }
}

// ----------------------------------------------------------------------------------

export function goBack() {
  const func = '.goBack';

  try {
    const rendererState = storeManager.rendererState;

    if (rendererState.containerType !== constants.CONTAINER_AUTOSELECT) {
      if (rendererState.itemIndex === 0) {

        if (isAutoPlay()) {
          storeManager.dispatchGlobal(rendererActions.createActionGoEnd());
        } else {
          storeManager.dispatchGlobal(rendererActions.createActionGoNoWhere());

          setTimeout(() => {
            storeManager.dispatchGlobal(rendererActions.createActionGoEnd());
          }, _rolloverFlickerTime);
        }

        return;
      }
    }

    storeManager.dispatchGlobal(rendererActions.createActionGoBack());

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
  }

}
// ----------------------------------------------------------------------------------

export function goNext() {
  const func = '.goNext';

  try {
    const rendererState = storeManager.rendererState;

    if (rendererState.containerType !== constants.CONTAINER_AUTOSELECT) {
      if (rendererState.itemIndex === rendererState.items.length - 1) {

        let action = null;
        if (isAutoPlay()) {
          storeManager.dispatchGlobal(rendererActions.createActionGoPos1());
        } else {
          storeManager.dispatchGlobal(rendererActions.createActionGoNoWhere());

          setTimeout(() => {
            storeManager.dispatchGlobal(rendererActions.createActionGoPos1());
          }, _rolloverFlickerTime);
        }

        return;
      }
    }

    storeManager.dispatchGlobal(rendererActions.createActionGoNext());

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
  }

}

// ----------------------------------------------------------------------------------
