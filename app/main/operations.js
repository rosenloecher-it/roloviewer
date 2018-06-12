import { app, crashReporter, shell } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import configMain from "./config/configMain";
import * as appConstants from "../common/appConstants";
import * as windows from './windows';
import {mkDirByPathSync} from "./config/configUtils";

// ----------------------------------------------------------------------------------

export function startCrashReporter() {
  crashReporter.start({
    productName: app.getName(),
    companyName: appConstants.COMPANY_NAME,
    submitURL: appConstants.URL_CRASH_REPORT,
    uploadToServer: false
  });
}

// ----------------------------------------------------------------------------------

export function configLogger() {
  // https://www.npmjs.com/package/electron-log

  const logConfig = configMain.getLogConfig();

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

  log.info(`${appConstants.APP_TITLE} v(${appConstants.APP_VERSION}) started`);

}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {

  const window = windows.getMainWindow();

  if (window) {
    const isFullScreen = window.isFullScreen();
    if (!isFullScreen)
      configMain.setWindowState(window);
    window.setFullScreen(!isFullScreen);
  }
}

// ----------------------------------------------------------------------------------

export function toogleDevTools() {
  const window = windows.getMainWindow();

  if (window && configMain.showDevTools()) {
    const activeDevTools = configMain.activeDevTools();
    configMain.setActiveDevTools(!activeDevTools);

    if (activeDevTools)
      window.webContents.closeDevTools();
    else
      window.webContents.openDevTools();
  }
}

// ----------------------------------------------------------------------------------

export function restoreDevTools() {
  const window = windows.getMainWindow();

  if (window && configMain.showDevTools()) {
    if (configMain.activeDevTools()) {
      window.webContents.openDevTools();
    }
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
