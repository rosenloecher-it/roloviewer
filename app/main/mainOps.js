import { app, crashReporter, shell, dialog } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import config from "./config/mainConfig";
import * as constants from "../common/constants";
import * as windows from './windows';
import {mkDirByPathSync} from "./config/configUtils";
import * as ipc from './mainIpc';

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

  const logConfig = config.getLogConfig();

  if (logConfig.logLevelFile)
    log.transports.console.level = logConfig.logLevelFile;

  if (logConfig.logfile) {
    if (logConfig.logLevelConsole)
      log.transports.file.level = logConfig.logLevelConsole;

    const parentDir = path.dirname(logConfig.logfile);
    if (!fs.existsSync(parentDir)) {
      mkDirByPathSync(parentDir);
    }

    if (logConfig.logDeleteOnStart && fs.existsSync(logConfig.logfile)) {
      fs.unlinkSync(logConfig.logfile);
      if (fs.existsSync(logConfig.logfile))
        log.error(`ERROR: cannot delete file ${logConfig.logfile}!`);
    }

    log.transports.file.file = logConfig.logfile;
    log.transports.file.maxSize = 5 * 1024 * 1024;
  }

  log.info(`${constants.APP_TITLE} (v${constants.APP_VERSION}) started`);

}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {

  const window = windows.getMainWindow();

  if (window) {
    const isFullScreen = window.isFullScreen();
    if (!isFullScreen)
      config.setMainWindowState(window);
    window.setFullScreen(!isFullScreen);
  }
}

// ----------------------------------------------------------------------------------

export function toogleDevTools() {
  const window = windows.getMainWindow();

  if (window && config.showDevTools()) {
    const activeDevTools = config.activeDevTools();
    config.setActiveDevTools(!activeDevTools);

    if (activeDevTools)
      window.webContents.closeDevTools();
    else
      window.webContents.openDevTools();
  }
}

// ----------------------------------------------------------------------------------

export function restoreDevTools() {
  const window = windows.getMainWindow();

  if (window && config.showDevTools()) {
    if (config.activeDevTools()) {
      window.webContents.openDevTools();
    }
  }
}

// ----------------------------------------------------------------------------------

export function initChildConfig(ipcMsg) {
  const func = ".initChildConfig";
  //log.debug(`${logKey}${func}`, ipcMsg);

  const ipcDest = ipcMsg.source;

  const data = config.exportData();
  ipc.send(ipcDest, constants.ACTION_PUSH_MAIN_CONFIG, data);

}
// ----------------------------------------------------------------------------------

const flagWorker = 1;
const flagRenderer = 2;
const flagSendStart = 4;
let statusChildsState = flagWorker | flagRenderer | flagSendStart;

export function activateChild(ipcMsg) {
  const func = ".activateChild";
  //log.debug(`${logKey}${func}`, ipcMsg);

  const ipcDest = ipcMsg.source;

  // waiting for 2 children - don't know which one comes last => send last opened dir or slideshow
  if (constants.IPC_RENDERER === ipcDest)
    statusChildsState &= ~flagRenderer;
  if (constants.IPC_WORKER === ipcDest)
    statusChildsState &= ~flagWorker;

  if (statusChildsState === flagSendStart) {
    statusChildsState = 0;
    const container = config.getLastContainer();

    //log.debug(`${logKey}${func} - getLastContainer:`, container);

    setTimeout(() => {
      ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, { container });
    }, 100)

  }

}

// ----------------------------------------------------------------------------------

export function openDialog(isDirectory) {
  const func = ".openDialog";

  const lastPath = config.getLastDialogFolder();
  //log.debug(`${logKey}${func} - lastPath:`, lastPath);

  const dialogType = isDirectory ? 'openDirectory' : 'openFile';

  const files = dialog.showOpenDialog(
    {
      defaultPath: lastPath,
      properties: [ dialogType ]
    });

  if (files && Array.isArray(files) && files.length === 1) {
    const selection = files[0];
    log.debug(`${logKey}${func} - selection:`, selection);

    config.setLastDialogFolder(path.dirname(selection));

    return selection;
  }
}

// ----------------------------------------------------------------------------------

export function openDirectory() {

  log.debug('open directory clicked');

  const folder = openDialog(true);
  if (folder)
    ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, { container: folder });
}

// ----------------------------------------------------------------------------------

export function openPlayList() {
  log.debug('open playlist clicked');

  const playlist = openDialog(false);
  if (playlist)
    ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, { container: playlist });
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

    ipc.send(constants.IPC_RENDERER, constants.ACTION_SHUTDOWN, null);
    ipc.send(constants.IPC_WORKER, constants.ACTION_SHUTDOWN, null);

    app.quit();
  }
}

// ----------------------------------------------------------------------------------

export function askQuitApp() {
  if (!isAppAlreadyQuitted) {
    ipc.send(constants.IPC_RENDERER, constants.ACTION_ESC_CLOSING, null);
  }
}

// ----------------------------------------------------------------------------------

export function toogleHelp() {
  log.silly('toogleHelp');
  ipc.send(constants.IPC_RENDERER, constants.ACTION_HELP_TOOGLE, null);
}

// ----------------------------------------------------------------------------------

export function sendGeneric(destination, action) {

  const func = ".sendGeneric";
  log.silly(`${logKey}${func} destination=${destination}, action=${action}`);
  //ops.sendGeneric(constants.IPC_RENDERER, constants.ACTION_HELP_TOOGLE);
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
  // ipc.send(constants.IPC_RENDERER, constants.ACTION_MSG_ADD, payload);
}

// ----------------------------------------------------------------------------------

export function setLastItem(ipcMsg) {

  //log.debug(`${logKey}.setLastItem: -`, ipcMsg.payload);
  config.setLastItem(ipcMsg.payload.lastItemFile, ipcMsg.payload.lastContainer);
}

// ----------------------------------------------------------------------------------

export function setAutoPlay(ipcMsg) {

  //log.debug(`${logKey}.setAutoPlay: -`, ipcMsg.payload);
  config.lastAutoPlay = ipcMsg.payload
}

// ----------------------------------------------------------------------------------

export function debug1() {
  log.debug('debug1');
  ipc.sendShowMessage(constants.MSG_TYPE_INFO, "msgText - info", "msgDetails");
}

// ----------------------------------------------------------------------------------

export function debug2() {
  log.debug('debug2');
  ipc.sendShowMessage(constants.MSG_TYPE_WARNING, "msgText - warn", "msgDetails");
}

// --------------------------------------------------------------------------------

export function debug3() {
  log.debug('debug3');
  ipc.sendShowMessage(constants.MSG_TYPE_ERROR, "msgText - error", "msgDetails");
}

// --------------------------------------------------------------------------------
