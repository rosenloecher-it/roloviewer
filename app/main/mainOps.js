import { app, crashReporter, shell, dialog } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../common/constants";
import * as windows from './windows';
import {mkDirByPathSync} from "./config/fileTools";
import * as ipc from './mainIpc';
import * as powerSaveBlocker from "./powerSaveBlocker";
import * as actionsSls from "../common/store/slideshowActions";
import storeManager from './store/mainManager';
import * as actionsMainWindow from "../common/store/mainWindowActions";
import * as actionsSystem from "../common/store/systemActions";

// ----------------------------------------------------------------------------------

const logKey = "mainOps";

// ----------------------------------------------------------------------------------

export function startCrashReporter() {
  crashReporter.start({
    productName: app.getName(),
    companyName: constants.COMPANY_NAME,
    submitURL: constants.URL_CRASH_REPORT,
    uploadToServer: false
  });
}

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
        mkDirByPathSync(parentDir);
      }

      log.transports.file.file = logConfig.logfile;
      log.transports.file.maxSize = 5 * 1024 * 1024;
    }

    log.info(`${constants.APP_TITLE} (v${constants.APP_VERSION}) started`);
  } else
    console.log(`${logKey}.configLogger failed - no config data`);
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

    log.debug(`${logKey}${func} - ${ipcDest} ready`);

    if (statusChildsState === flagSendStart) {
      statusChildsState = 0;

      //storeManager.dispatchFullState([ ipcDest ]);

      // let payload = null;
      // if (config.lastContainer)
      //   payload = { container: config.lastContainer, selectFile: config.lastItem };
      //
      //
      // //log.debug(`${_logKey}${func} - getLastContainer:`, container);
      //
      // setTimeout(() => {
      //   ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, payload);
      // }, 200)

    }
  } catch (err) {
    log.error(`${this._logKey}${func} - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function openDialog(isDirectory) {
  const func = ".openDialog";

  const lastPath = config.getLastDialogFolder();
  //log.debug(`${_logKey}${func} - lastPath:`, lastPath);

  const dialogType = isDirectory ? 'openDirectory' : 'openFile';

  const files = dialog.showOpenDialog(
    {
      defaultPath: lastPath,
      properties: [ dialogType ]
    });

  if (files && Array.isArray(files) && files.length === 1) {
    const selection = files[0];
    log.debug(`${logKey}${func} - selection:`, selection);

    const action = actionsSystem.createActionSetLastDialogFolder(path.dirname(selection));
    storeManager.dispatchGlobal(action);

    return selection;
  }
}

// ----------------------------------------------------------------------------------

export function openDirectory() {
  const folder = openDialog(true);
  if (folder)
    ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, { container: folder });
}

// ----------------------------------------------------------------------------------

export function openPlayList() {
  const playlist = openDialog(false);
  if (playlist)
    ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, { container: playlist });
}

// ----------------------------------------------------------------------------------

export function openItemDirectory() {
  ipc.send(constants.IPC_RENDERER, constants.ACTION_OPEN_ITEM_FOLDER, null);
}

// ----------------------------------------------------------------------------------

export function autoSelect() {
  log.debug('auto-select clicked');
  ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, null);
}

// ----------------------------------------------------------------------------------

let isAppAlreadyQuitted = false;

export function quitApp() {
  // closeMainWindow was called twice
  if (!isAppAlreadyQuitted) {
    isAppAlreadyQuitted = true;

    powerSaveBlocker.shutdown();

    ipc.send(constants.IPC_RENDERER, constants.AI_SHUTDOWN, null);
    ipc.send(constants.IPC_WORKER, constants.AI_SHUTDOWN, null);

    app.quit();
  }
}

// ----------------------------------------------------------------------------------

export function askQuitApp() {

  quitApp();

  // if (!isAppAlreadyQuitted) {
  //   ipc.send(constants.IPC_RENDERER, constants.ACTION_ESC_CLOSING, null);
  // }
}

// ----------------------------------------------------------------------------------

export function toogleHelp() {
  log.debug('toogleHelp');
  //ipc.send(constants.IPC_RENDERER, constants.AR_SLIDESHOW_HELP_TOOGLE, null);

  const action = actionsSls.createActionHelpToogle();
  ipc.send(constants.IPC_RENDERER, constants.AI_SPREAD_REDUX_ACTION, action);
}

// ----------------------------------------------------------------------------------

export function sendGeneric(destination, action) {

  const func = ".sendGeneric";
  log.silly(`${logKey}${func} destination=${destination}, action=${action}`);
  //ops.sendGeneric(constants.IPC_RENDERER, constants.AR_SLIDESHOW_HELP_TOOGLE);
}

// ----------------------------------------------------------------------------------

export function showAbout() {
  log.debug('showAbout');
}

// ----------------------------------------------------------------------------------

export function openWebsite() {
  log.debug('openWebsite');
  shell.openExternal('https://electronjs.org');
}

// ----------------------------------------------------------------------------------

export function showMessage(msgType, msgText) {

  const payload = { msgType, msgText };

  // TODO
  // ipc.send(constants.IPC_RENDERER, constants.AR_MESSAGE_ADD, payload);
}

// ----------------------------------------------------------------------------------

export function setLastItem(ipcMsg) {

  //log.debug(`${_logKey}.setLastItem: -`, ipcMsg.payload);
  config.setLastItemAndContainer(ipcMsg.payload.lastItemFile, ipcMsg.payload.lastContainer);
}

// ----------------------------------------------------------------------------------

export function setAutoPlay(ipcMsg) {

  //log.debug(`${_logKey}.setAutoPlay: -`, ipcMsg.payload);
  config.lastAutoPlay = ipcMsg.payload
}

// ----------------------------------------------------------------------------------

export function debug1() {
  log.debug('debug1');
  ipc.sendShowMessage(constants.MSG_TYPE_INFO, "msgText - info");
}

// ----------------------------------------------------------------------------------

export function debug2() {
  log.debug('debug2');
  ipc.sendShowMessage(constants.MSG_TYPE_WARNING, "msgText - warn");
}

// --------------------------------------------------------------------------------

export function debug3() {
  log.debug('debug3');
  ipc.sendShowMessage(constants.MSG_TYPE_ERROR, "msgText - error");
}

// --------------------------------------------------------------------------------
