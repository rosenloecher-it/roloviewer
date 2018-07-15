import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import storeManager from "./store/rendererManager";

// ----------------------------------------------------------------------------------

const _logKey = "rendererOps";

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
    ipc.unregisterListener();
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
    ipc.send(constants.IPC_MAIN, constants.AI_QUIT_SCREENSAVER);
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
