import { crashReporter, shell } from 'electron';
import configMain from "./configMain";
import * as appConstants from "../common/appConstants";
import * as mainWindow from './mainWindow';

// ----------------------------------------------------------------------------------

export function startCrashReporter() {
  crashReporter.start({
    productName: appConstants.APP_TITLE,
    companyName: appConstants.COMPANY_NAME,
    submitURL: appConstants.URL_CRASH_REPORT,
    uploadToServer: false
  });
}

// ----------------------------------------------------------------------------------

export function toogleFullscreen() {

  const window = mainWindow.getRef();

  if (window) {
    const isFullScreen = window.isFullScreen();
    if (!isFullScreen)
      configMain.setWindowState(window);
    window.setFullScreen(!isFullScreen);
  }
}

// ----------------------------------------------------------------------------------

export function toogleDevTools() {
  const window = mainWindow.getRef();

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
  const window = mainWindow.getRef();

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
