import { BrowserWindow, Menu } from 'electron';
import path from 'path';
import log from 'electron-log';
import * as ops from "./mainOps";
import config from "./config/mainConfig";
import * as constants from "../common/constants";

let mainWindow = null;
let workerWindow = null;

// ----------------------------------------------------------------------------------

export function getMainWindow() {
  return mainWindow;
}

// ----------------------------------------------------------------------------------

function closeMainWindow() {
  //log.debug("closeMainWindow");
  ops.quitApp();
}

// ----------------------------------------------------------------------------------

function storeMainWindowState() {
  if (mainWindow)
    config.setMainWindowState(mainWindow);
}

// ----------------------------------------------------------------------------------

export function createMainWindow() {

  if (mainWindow)
    return;

  config.checkMainWindowBounds();

  const windowState = config.getMainWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: constants.DEFCONF_WIDTH_MIN,
    minHeight: constants.DEFCONF_HEIGHT_MIN,
    backgroundColor: 'black', // has to match style!
    show: false
  });

  const htmlPath = path.join(__dirname, '..', 'renderer', 'app.html');
  mainWindow.loadURL(`file://${htmlPath}`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) throw new Error('"windows" is not defined');

    mainWindow.setTitle(constants.APP_TITLE);
    mainWindow.show();

    if (windowState.fullscreen)
      mainWindow.setFullScreen(true)
    else if (windowState.maximized)
      mainWindow.maximize();

    mainWindow.on('close', closeMainWindow);

    if (config.showDevTools()) {
      ops.restoreDevTools();

      // add inspect element on right click mainMenu
      mainWindow.webContents.on('context-mainMenu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              mainWindow.inspectElement(props.x, props.y);
            }
          }
        ]).popup(mainWindow);
      });
    }

    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', storeMainWindowState);
  mainWindow.on('move', storeMainWindowState);
}

// ----------------------------------------------------------------------------------

export function getWorkerWindow() {
  return workerWindow;
}

// ----------------------------------------------------------------------------------

function closeWorkerWindow() {
  //log.debug("closeWorkerWindow");
  ops.quitApp();
}

// ----------------------------------------------------------------------------------

export function createWorkerWindow() {

  if (workerWindow)
    return;

  const htmlPath = path.join(__dirname, '..', 'worker', 'worker.html');

  workerWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  });

  //log.debug("workerWindow.loadURL", htmlPath);
  workerWindow.loadURL(`file://${htmlPath}`);

  workerWindow.webContents.on('did-finish-load', () => {
    if (!workerWindow)
      throw new Error('"windows" is not defined');

    if (constants.DEBUG_SHOW_WORKER_WINDOW) {
      workerWindow.webContents.openDevTools();
      workerWindow.show();
    }

  });

  workerWindow.on('close', closeWorkerWindow);

  workerWindow.on('closed', () => {
    workerWindow = null;
  });
}

// ----------------------------------------------------------------------------------
