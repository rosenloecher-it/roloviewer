import { remote } from 'electron';
import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import storeManager from "./store/rendererManager";
import * as rendererActions from "../common/store/rendererActions";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";
const _rolloverFlickerTime = 300;

// ----------------------------------------------------------------------------------

export function init() {
  const func = ".init";

  try {
    storeManager.sender = ipc;

    ipc.send(constants.IPC_MAIN, constants.AI_CHILD_IS_READY, null);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function shutdown() {

  try {
    ipc.shutdownIpc();
  } catch (err) {
    log.error(`${_logKey}.shutdown -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {

  try {
    ipc.send(constants.IPC_MAIN, constants.AI_TOOGLE_FULLSCREEN);
  } catch (err) {
    log.error(`${_logKey}.toogleFullscreen -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function quitScreensaver() {
  try {
    ipc.send(constants.IPC_MAIN, constants.AI_QUITTING_SCREENSAVER_MODE);
    log.debug(`${_logKey}.quitScreensaver send`);
  } catch (err) {
    log.error(`${_logKey}.quitScreensaver -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function openUrl(url) {
  const func = '.openUrl';

  try {
    //log.debug(`${_logKey}${func}: ${url}`);
    remote.shell.openExternal(url);

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function openFile(file) {
  const func = '.openFile';

  try {
    log.debug(`${_logKey}${func}: ${file}`);
    //remote.shell.openExternal(url);

    remote.shell.openItem(file);

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
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

export function goNext(triggeredByAutoplay = false) {
  const func = '.goNext';

  try {
    const rendererState = storeManager.rendererState;

    if (rendererState.containerType !== constants.CONTAINER_AUTOSELECT) {
      if (rendererState.itemIndex === rendererState.items.length - 1) {

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

    storeManager.dispatchGlobal(rendererActions.createActionGoNext(triggeredByAutoplay));

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
  }

}

// ----------------------------------------------------------------------------------
