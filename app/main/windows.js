import electron from 'electron';
import path from 'path';
import log from 'electron-log';
import * as ops from "./mainOps";
import * as constants from "../common/constants";
import storeManager from './store/mainManager';
import * as actionsMainWindow from "../common/store/mainWindowActions";

// ----------------------------------------------------------------------------------

const _logKey = "windows";

let mainWindow = null;
let workerWindow = null;

// ----------------------------------------------------------------------------------

export function getMainWindow() {
  return mainWindow;
}

// ----------------------------------------------------------------------------------

function closeMainWindow() {
  //log.debug("closeMainWindow");
  ops.quittingApp();
}

// ----------------------------------------------------------------------------------

function checkAndCorrectMainWindowBounds(settings, screenSize) {

  let resetBounds = true;
  const space = 100;
  do {
    if (!settings.x || settings.x < 0 || settings.x >= screenSize.width - space)
      break;
    if (!settings.y || settings.y < 0 || settings.y >= screenSize.height - space)
      break;
    if (!settings.height || settings.height < constants.DEFCONF_HEIGHT_DEF || settings.height > screenSize.height)
      break;
    if (!settings.width || settings.width < constants.DEFCONF_WIDTH_DEF || settings.width > screenSize.width)
      break;

    resetBounds = false;

  } while (false);

  if (resetBounds) {
    /* eslint-disable no-param-reassign */
    settings.height = screenSize.height < constants.DEFCONF_HEIGHT_DEF ? screenSize.height : constants.DEFCONF_HEIGHT_DEF;
    settings.width = screenSize.width < constants.DEFCONF_WIDTH_DEF ? screenSize.width : constants.DEFCONF_WIDTH_DEF;
    settings.x = (screenSize.width - settings.width) / 2;
    settings.y = (screenSize.height - settings.height) / 2;
    /* eslint-enable no-param-reasign */
  }

  // don't reset: config.maximized + config.fullscreen + config.activeDevtool

}

// ----------------------------------------------------------------------------------

function storeMainWindowState() {
  const func = ".storeMainWindowState";

  if (!mainWindow)
    return;

  try {
    let action = null;

    const win = mainWindow;

    const isFullscreen = win.isFullScreen();
    if (isFullscreen)
      action = actionsMainWindow.createActionSetFullscreen(isFullscreen);
    else {
      const isMaximized = win.isMaximized();
      if (isMaximized)
        action = actionsMainWindow.createActionSetMaximized(isMaximized);
      else {
        const actionData = {};
        const bounds = win.getBounds();
        actionData.height = bounds.height;
        actionData.width = bounds.width;
        actionData.x = bounds.x;
        actionData.y = bounds.y;

        actionData.fullscreen = false;
        actionData.maximized = false;
        actionData.activeDevtool = storeManager.activeDevtool;

        action = actionsMainWindow.createActionInitReducer(actionData);
      }
    }

    //log.debug(`${_logKey}${func} - data -`, action);

    storeManager.dispatchLocal(action);

  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function createMainWindow() {
  const func = ".createMainWindow";

  if (mainWindow)
    return;

  try {

    const settings = storeManager.mainWindowState;
    const screenSize = electron.screen.getPrimaryDisplay().size;

    checkAndCorrectMainWindowBounds(settings, screenSize);

    mainWindow = new electron.BrowserWindow({
      width: settings.width,
      height: settings.height,
      x: settings.x,
      y: settings.y,
      minWidth: constants.DEFCONF_WIDTH_MIN,
      minHeight: constants.DEFCONF_HEIGHT_MIN,
      backgroundColor: 'black', // has to match style!
      icon: path.join(__dirname, '..', 'icon', 'icon512.png'),
      show: false,
      webPreferences: {
        webSecurity: false
      }
    });

    mainWindow.onerror = (message, source, lineno, colno, error) => {
      log.error(`${_logKey}.onerror - message: ${message} \n source: ${source} \n line/col=${lineno}/${colno}`, error);
    };

    const htmlPath = path.join(__dirname, '..', 'renderer', 'app.html');
    mainWindow.loadURL(`file://${htmlPath}`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) throw new Error('"windows" is not defined');

      mainWindow.setTitle(constants.APP_TITLE);
      mainWindow.show();

      if (settings.fullscreen)
        mainWindow.setFullScreen(true);
      else if (settings.maximized)
        mainWindow.maximize();

      mainWindow.on('close', closeMainWindow);

      if (settings.activeDevtool) {
        ops.restoreDevTools();

        // add inspect element on right click mainMenu
        mainWindow.webContents.on('context-mainMenu', (e, props) => {
          electron.Menu.buildFromTemplate([
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
  } catch (err) {
    log.error(`${_logKey}${func} - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

export function getWorkerWindow() {
  return workerWindow;
}

// ----------------------------------------------------------------------------------

function closeWorkerWindow() {
  //log.debug("closeWorkerWindow");
  ops.quittingApp();
}

// ----------------------------------------------------------------------------------

export function createWorkerWindow() {

  if (workerWindow)
    return;

  try {
    const htmlPath = path.join(__dirname, '..', 'worker', 'worker.html');

    workerWindow = new electron.BrowserWindow({
      width: 600,
      height: 400,
      show: false,
      webPreferences: {
        nodeIntegrationInWorker: true,
        webSecurity: false

      }
    });

    workerWindow.onerror = (message, source, lineno, colno, error) => {
      log.error(`${_logKey}.onerror(worker) - message: ${message} \n source: ${source} \n line/col=${lineno}/${colno}`, error);
    };

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
  } catch (err) {
    log.error(`${_logKey}.createWorkerWindow - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------
