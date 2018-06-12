import { BrowserWindow, Menu } from 'electron';
import path from 'path';
import log from 'electron-log';
import * as operations from "./operations";
import configMain from "./configMain";
import * as appConstants from "../common/appConstants";

let mainWindow = null;

// ----------------------------------------------------------------------------------

export function getRef() {
  return mainWindow;
}

// ----------------------------------------------------------------------------------

function closeMainWindow() {
  configMain.saveConfig()
}

// ----------------------------------------------------------------------------------

function storeMainWindowState() {
  if (mainWindow)
    configMain.setWindowState(mainWindow);
}

// ----------------------------------------------------------------------------------

export function createMainWindow() {

  configMain.initWindowConfig();

  const windowState = configMain.getWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: appConstants.SIZE_WIDTH_MIN,
    minHeight: appConstants.SIZE_HEIGHT_MIN,
    backgroundColor: '#202b33', // has to match style!
    show: false
  });

  const htmlPath = path.join(__dirname, '..', 'renderer', 'app.html');
  log.debug("createMainWindow: ", htmlPath);
  mainWindow.loadURL(`file://${htmlPath}`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');

    mainWindow.setTitle(appConstants.APP_TITLE);
    mainWindow.show();

    if (windowState.maximized) mainWindow.maximize();
    // BrowserWindow.setFullScreen(true)

    mainWindow.on('close', closeMainWindow);

    if (configMain.showDevTools()) {
      operations.restoreDevTools();

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
