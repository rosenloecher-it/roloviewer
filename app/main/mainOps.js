import { app, crashReporter, shell } from 'electron';
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

  if (logConfig.loglevel_file)
    log.transports.console.level = logConfig.loglevel_file;

  if (logConfig.logfile) {
    if (logConfig.loglevel_console)
      log.transports.file.level = logConfig.loglevel_console;

    const parentDir = path.dirname(logConfig.logfile);
    if (!fs.existsSync(parentDir)) {
      mkDirByPathSync(parentDir);
    }

    if (logConfig.log_delete_on_start && fs.existsSync(logConfig.logfile)) {
      fs.unlinkSync(logConfig.logfile);
      if (fs.existsSync(logConfig.logfile))
        console.log(`ERROR: cannot delete file ${logConfig.logfile}!`);
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

const flagWorker = 1;
const flagRenderer = 2;
const flagSendStart = 4;
let statusChildsState = flagWorker | flagRenderer | flagSendStart;

export function initChild(ipcMsg) {

  const ipcDest = ipcMsg.source;

  const data = config.exportConfig();
  ipc.send(ipcDest, constants.ACTION_PUSH_MAIN_CONFIG, data);

  // waiting for 2 children - don't know which one comes last => send last opened dir or slideshow
  if (constants.IPC_RENDERER === ipcDest)
    statusChildsState &= ~flagRenderer;
  if (constants.IPC_WORKER === ipcDest)
    statusChildsState &= ~flagWorker;

  if (statusChildsState === flagSendStart) {
    statusChildsState = 0;
    const container = config.getLastContainer();

    setTimeout(() => {
      ipc.send(constants.IPC_WORKER, constants.ACTION_OPEN, { container });
    }, 100)

  }

}

// ----------------------------------------------------------------------------------

export function openDirectory() {
  console.log('open directory clicked');
}

// ----------------------------------------------------------------------------------

export function openPlayList() {
  console.log('open playlist clicked');
}

// ----------------------------------------------------------------------------------

export function autoSelect() {
  console.log('auto-select clicked');
}

// ----------------------------------------------------------------------------------

let isAppAlreadyQuitted = false;

export function quitApp() {

  if (!isAppAlreadyQuitted) {
    isAppAlreadyQuitted = true;
    app.quit();
  }
}

// ----------------------------------------------------------------------------------

export function showHelp() {
  console.log('showHelp');
}

// ----------------------------------------------------------------------------------

export function showAbout() {
  console.log('showAbout');
}

// ----------------------------------------------------------------------------------

export function learnMore() {
  console.log('learnMore');
  shell.openExternal('https://electronjs.org');
}

// ----------------------------------------------------------------------------------

export function showMessage(msgType, msgText) {

  const payload = { msgType, msgText };

  // TODO
  // ipc.send(constants.IPC_RENDERER, constants.ACTION_SHOW_MESSAGE, payload);
}

// ----------------------------------------------------------------------------------

export function forwardShowFiles(ipcMsg) {

  log.debug(`${logKey}.forwardShowFiles: ${ipcMsg.payload.container}`);

  config.setLastContainer(ipcMsg.payload.container);

  ipc.send(constants.IPC_RENDERER, constants.ACTION_SHOW_FILES, ipcMsg.payload);


}

// ----------------------------------------------------------------------------------
