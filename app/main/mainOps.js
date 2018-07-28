import { app, clipboard, shell, dialog } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../common/constants";
import * as windows from './windows';
import * as fileUtils from "../common/utils/fileUtils";
import * as ipc from './mainIpc';
import * as powerSaveBlocker from "./powerSaveBlocker";
import * as rendererActions from "../common/store/rendererActions";
import storeManager from './store/mainManager';
import * as actionsMainWindow from "../common/store/mainWindowActions";
import * as workerActions from "../common/store/workerActions";
import * as actionsSystem from "../common/store/systemActions";
import {MetaReader} from '../worker/crawler/metaReader';
import deepmerge from "deepmerge";

// ----------------------------------------------------------------------------------

const _logKey = "mainOps";

// ----------------------------------------------------------------------------------

export function configLogger() {
  // https://www.npmjs.com/package/electron-log

  const logConfig = storeManager.logConfig;

  if (logConfig) {

    if (logConfig.logLevelFile)
      log.transports.console.level = logConfig.logLevelFile;

    if (logConfig.logfile) {
      if (logConfig.logLevelConsole)
        log.transports.file.level = logConfig.logLevelConsole;

      const parentDir = path.dirname(logConfig.logfile);
      if (!fs.existsSync(parentDir)) {
        fileUtils.mkDirWithParents(parentDir);
      }

      log.transports.file.file = logConfig.logfile;
      log.transports.file.maxSize = 5 * 1024 * 1024;
    }

    log.info(`${constants.APP_TITLE} (v${constants.APP_VERSION}) started`);
  } else
    console.log(`${_logKey}.configLogger failed - no config data`);
}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {

  const window = windows.getMainWindow();

  if (window) {
    let isFullScreen = window.isFullScreen();
    window.setFullScreen(!isFullScreen);

    isFullScreen = window.isFullScreen();

    const action = actionsMainWindow.createActionSetFullscreen(isFullScreen);
    storeManager.dispatchGlobal(action);
  }
}

// ----------------------------------------------------------------------------------

export function ensureFullscreen(value) {

  const window = windows.getMainWindow();

  if (window) {
    let isFullScreen = window.isFullScreen();

    if (!!value !== isFullScreen)
      window.setFullScreen(value);

    isFullScreen = window.isFullScreen();
    const action = actionsMainWindow.createActionSetFullscreen(isFullScreen);
    storeManager.dispatchGlobal(action);
  }
}

// ----------------------------------------------------------------------------------

export function toogleDevTools() {
  const window = windows.getMainWindow();

  if (window && storeManager.isDevtool) {

    // https://github.com/electron/electron/blob/master/docs/api/web-contents.md
    window.webContents.toggleDevTools();

    const isOpen = window.webContents.isDevToolsOpened();
    const action = actionsMainWindow.createActionSetActiveDevtool(isOpen);
    storeManager.dispatchGlobal(action);
  }
}

// ----------------------------------------------------------------------------------

export function restoreDevTools() {
  const window = windows.getMainWindow();

  if (window && storeManager.isDevtool) {
    if (storeManager.activeDevtool) {
      window.webContents.openDevTools();
    }
  }
}

// ----------------------------------------------------------------------------------

export function initChildConfig(ipcMsg) {
  const func = ".initChildConfig";
  //log.debug(`${_logKey}${func}`, ipcMsg);

  const ipcDest = ipcMsg.source;

  // TODO remove db-deletion on start-up
  fileUtils.deleteFile('/home/raul/.config/RoloSlider/rolosliderTestDir.db');
  fileUtils.deleteFile('/home/raul/.config/RoloSlider/rolosliderTestStatus.db');

  storeManager.dispatchFullState([ ipcDest ]);

  ipc.send(ipcDest, constants.AI_MAIN_PUSHED_CONFIG);

  //storeManager.dumpState2Log();

}
// ----------------------------------------------------------------------------------

const flagWorker = 1;
const flagRenderer = 2;
const flagSendStart = 4;
let statusChildsState = flagWorker | flagRenderer | flagSendStart;

export function activateChild(ipcMsg) {
  const func = ".activateChild";
  //log.debug(`${_logKey}${func}`, ipcMsg);

  try {
    const ipcDest = ipcMsg.source;

    // waiting for 2 children - don't know which one comes last => send last opened dir or slideshow
    if (constants.IPC_RENDERER === ipcDest)
      statusChildsState &= ~flagRenderer;
    if (constants.IPC_WORKER === ipcDest)
      statusChildsState &= ~flagWorker;

    //log.debug(`${_logKey}${func} - ${ipcDest} ready`);

    if (statusChildsState === flagSendStart) {
      statusChildsState = 0;

      const state = storeManager.slideshowState;
      const action = workerActions.createActionStart(state.lastContainerType, state.lastContainer, state.lastItem);
      storeManager.dispatchGlobal(action);

    }
  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function openDialog(isDirectory) {
  const func = ".openDialog";

  let lastDialogFolder = storeManager.lastDialogFolder;
  log.debug(`${_logKey}${func} - lastDialogFolder - in:`, lastDialogFolder);

  const dialogType = isDirectory ? 'openDirectory' : 'openFile';

  const files = dialog.showOpenDialog(
    {
      defaultPath: lastDialogFolder,
      properties: [ dialogType ]
    });

  if (files && Array.isArray(files) && files.length === 1) {
    const selection = files[0];
    log.debug(`${_logKey}${func} - selection:`, selection);
    lastDialogFolder = path.dirname(selection);
    log.debug(`${_logKey}${func} - lastDialogFolder - out:`, lastDialogFolder);
    const action = actionsSystem.createActionSetLastDialogFolder(lastDialogFolder);
    storeManager.dispatchGlobal(action);

    return selection;
  }
}

// ----------------------------------------------------------------------------------

export function openDirectory() {
  const folder = openDialog(true);
  if (folder) {
    const action = workerActions.createActionOpenFolder(folder);
    storeManager.dispatchGlobal(action);
  }
}

// ----------------------------------------------------------------------------------

export function openPlayList() {
  const playlist = openDialog(false);
  if (playlist) {
    const action = workerActions.createActionOpenPlaylist(playlist);
    storeManager.dispatchGlobal(action);
  }
}

// ----------------------------------------------------------------------------------

export function openItemDirectory() {

  const slideshowState = storeManager.slideshowState;

  if (slideshowState && slideshowState.lastItem) {
    const folder = path.dirname(slideshowState.lastItem);
    const action = workerActions.createActionOpenFolder(folder, slideshowState.lastItem);
    storeManager.dispatchGlobal(action);
  }
}

// ----------------------------------------------------------------------------------

export function autoSelect() {
  log.debug(`${_logKey}.autoSelect`);

  const action = workerActions.createActionAutoSelect();
  storeManager.dispatchGlobal(action);
}

// ----------------------------------------------------------------------------------

let _isAppAlreadyQuitted = false;

export function quittingApp() {
  const func = '.quittingApp';
  // closeMainWindow was called twice
  if (!_isAppAlreadyQuitted) {
    _isAppAlreadyQuitted = true;

    log.debug(`${_logKey}${func}`);

    powerSaveBlocker.shutdown();

    ipc.send(constants.IPC_RENDERER, constants.AI_SHUTDOWN, null);
    ipc.send(constants.IPC_WORKER, constants.AI_SHUTDOWN, null);

    setTimeout(() => {
      log.warn(`${_logKey}${func} - app should be finished by worker notification - NOT by this timer call!`);
      quitApp();
    }, 700);
  }
}

// ----------------------------------------------------------------------------------

export function quitApp() {
  // don't call directly
  if (_isAppAlreadyQuitted) {
    log.debug(`${_logKey}.quitApp`);
    ipc.shutdownIpc();
    app.quit();
  }
}

// ----------------------------------------------------------------------------------

export function hitEscKey() {
  const func = 'hitEscKey';

  try {
    if (_isAppAlreadyQuitted)
      return;

    const slideshowState = storeManager.slideshowState;
    if (slideshowState.helpShow) {
      const action = rendererActions.createActionHelpClose();
      storeManager.dispatchGlobal(action);
      return;
    }
    if (slideshowState.aboutShow) {
      const action = rendererActions.createActionAboutClose();
      storeManager.dispatchGlobal(action);
      return;
    }

    const mainWindowState = storeManager.mainWindowState;
    if (mainWindowState.fullscreen) {
      toogleFullscreen();
      return;
    }

    quittingApp();

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError()
  }
}

// ----------------------------------------------------------------------------------

export function toogleHelp() {
  log.debug('toogleHelp');
  const action = rendererActions.createActionHelpToogle();
  storeManager.dispatchGlobal(action);
}

// ----------------------------------------------------------------------------------

export function showAbout() {
  log.debug('showAbout');

  const action = rendererActions.createActionAboutOpen();
  storeManager.dispatchGlobal(action);
}

// ----------------------------------------------------------------------------------

export function openWebsite() {
  log.debug('openWebsite');
  shell.openExternal(constants.APP_URL);
}

// ----------------------------------------------------------------------------------

export function copyItemPath2Clipboard() {
  const func = '.copyItemPath2Clipboard';
  try {
    const currentItem = storeManager.currentItem;
    if (!currentItem || !currentItem.file)
      return;

    clipboard.writeText(currentItem.file);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function copyMeta2Clipboard() {
  const func = '.copyItemPath2Clipboard';
  try {
    const currentItem = storeManager.currentItem;

    if (!currentItem || !currentItem.file || !currentItem.meta)
      return;

    const meta = deepmerge.all([ currentItem.meta, {} ]);
    if (meta.time) delete meta.time;
    if (meta.dir) delete meta.dir;
    if (meta.file) delete meta.file;
    if (meta.filename) delete meta.filename;


    let maxLengthKey = 8;
    for (let key in meta) {
      const l = key.length;
      if (maxLengthKey < l)
        maxLengthKey = l;
    }

    const lines = [];
    for (let key in meta) {
      const line = `${key.padEnd(maxLengthKey)} : ${meta[key]}\n`;
      lines.push(line);
    }

    lines.sort();

    const date = new Date(currentItem.meta.time).toLocaleString();

    let text =    `${'file'.padEnd(maxLengthKey)} : ${currentItem.file}\n`;
    text = text + `${'date'.padEnd(maxLengthKey)} : ${date}\n`;
    text = text + lines.join('');

    clipboard.writeText(text);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function openMap() {
  const func = '.openMap';

  try {

    const currentItem = storeManager.currentItem;

    do {
      if (!currentItem || !currentItem.file || !currentItem.meta) {
        log.info(`${_logKey}${func} - no item/meta available!`);
        break;
      }

      const format = storeManager.meta2MapUrlFormat;

      if (!format || format.length === 0) {
        log.info(`${_logKey}${func} - no format defined!`);
        break;
      }

      const {meta} = currentItem;

      const url = MetaReader.formatGpsMeta(meta, format);
      if (url) {
        ensureFullscreen(false);
        shell.openExternal(url);
      }

    } while (false);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
    storeManager.showError(`${_logKey}${func} - exception - ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function debug1() {
  log.debug('debug1');
  //storeManager.showMessage(constants.MSG_TYPE_INFO, "msgText - info");

  copyMeta2Clipboard();
}

// ----------------------------------------------------------------------------------

export function debug2() {
  log.debug('debug2');
  storeManager.showMessage(constants.MSG_TYPE_WARNING, "msgText - warn");
}

// --------------------------------------------------------------------------------

export function debug3() {
  log.debug('debug3');
  storeManager.showMessage(constants.MSG_TYPE_ERROR, "msgText - error");
}

// --------------------------------------------------------------------------------
