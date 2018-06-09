/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, crashReporter, Menu, shell } from 'electron';
import WindowStateManager from 'electron-window-state-manager';
import settings from 'electron-json-config';
import * as appConstants from './appConstants';
import { default as configMain } from './main/configMain';

// ----------------------------------------------------------------------------------

export const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

let mainWindow = null;
let mainWindowState = null;

// ----------------------------------------------------------------------------------

function startCrashReporter() {
  crashReporter.start({
    productName: appConstants.APP_NAME,
    companyName: appConstants.COMPANY_NAME,
    submitURL: appConstants.URL_CRASH_REPORT,
    uploadToServer: false
  });
}

// ----------------------------------------------------------------------------------

function toogleDevTools() {
  if (mainWindow && isDevelopment) {
    let devToolsOpen = settings.get(appConstants.SETTING_DEVTOOLS_STATE);

    if (devToolsOpen === 1) {
      devToolsOpen = 0;
      mainWindow.webContents.closeDevTools();
    } else {
      devToolsOpen = 1;
      mainWindow.webContents.openDevTools();
    }

    settings.set(appConstants.SETTING_DEVTOOLS_STATE, devToolsOpen);
  }
}

// ----------------------------------------------------------------------------------

function restoreDevTools() {
  if (mainWindow && isDevelopment) {
    const devToolsOpen = settings.get(appConstants.SETTING_DEVTOOLS_STATE, 0);
    if (devToolsOpen === 1) {
      mainWindow.webContents.openDevTools();
    }
  }
}

// ----------------------------------------------------------------------------------

function createMenu() {
  const menuSectionFile = {
    label: 'File',
    submenu: [
      {
        label: 'Open directory',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          console.log('open directory clicked');
        }
      },
      {
        label: 'Open playlist ',
        accelerator: 'Shift+CmdOrCtrl+O',
        click: () => {
          console.log('open playlist clicked');
        }
      },
      {
        label: 'Auto-select',
        accelerator: 'CmdOrCtrl+A',
        click: () => {
          console.log('auto-select clicked');
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'ESC',
        click() {
          app.quit();
        }
      }
    ]
  };

  const menuSectionView = {
    label: 'View',
    submenu: [
      {
        role: 'reload',
        accelerator: 'CmdOrCtrl+R'
      },
      {
        role: 'togglefullscreen',
        accelerator: 'F11'
      }
    ]
  };

  if (isDevelopment) {
    menuSectionView.submenu.push({ type: 'separator' });

    menuSectionView.submenu.push({
      label: 'Toggle Developer Tools',
      accelerator: 'F12',
      click(item, focusedWindow) {
        if (focusedWindow) {
          toogleDevTools();
        }
      }
    });
  }

  const menuSectionHelp = {
    label: 'Help',
    submenu: [
      {
        label: 'Show help',
        accelerator: 'F1',
        click() {
          console.log('help clicked');
        }
      },
      {
        label: 'Learn More',
        click() {
          shell.openExternal('https://electronjs.org');
        }
      },
      { type: 'separator' },
      {
        label: 'About ...',
        click: () => {
          console.log('About Clicked');
        }
      }
    ]
  };

  const template = [menuSectionFile, menuSectionView, menuSectionHelp];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ----------------------------------------------------------------------------------

function allWindowsClosed() {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

// ----------------------------------------------------------------------------------

function closeMainWindow() {
  if (mainWindowState)
    mainWindowState.saveState(mainWindow);
}

// ----------------------------------------------------------------------------------

function createMainWindow() {
  const wasMainWindowMaximized = mainWindowState.maximized;

  mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: appConstants.SIZE_WIDTH_MIN,
    minHeight: appConstants.SIZE_HEIGHT_MIN,
    show: false
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');

    mainWindow.setTitle(appConstants.APP_NAME);
    mainWindow.show();

    if (wasMainWindowMaximized) mainWindow.maximize();

    // BrowserWindow.setFullScreen(true)

    mainWindow.on('close', closeMainWindow);

    if (isDevelopment) {
      restoreDevTools();

      // add inspect element on right click menu
      mainWindow.webContents.on('context-menu', (e, props) => {
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
}
// ----------------------------------------------------------------------------------

configMain.parseCli();

// ----------------------------------------------------------------------------------

if (!configMain.shouldExit()) {

  configMain.mergeConfigFiles();

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (isDevelopment) {
    require('electron-debug')();
    const path = require('path');
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
  }

  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
      extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(console.log);
  };

  startCrashReporter();

  mainWindowState = new WindowStateManager('mainWindow', {
    defaultWidth: appConstants.SIZE_WIDTH_DEF,
    defaultHeight: appConstants.SIZE_HEIGHT_DEF
  });

  createMenu();

  // ----------------------------------------------------------------------------------

  /**
   * Add event listeners...
   */

  app.on('window-all-closed', allWindowsClosed);

  app.on('ready', async () => {
    if (isDevelopment) {
      await installExtensions();
    }

    createMainWindow();
  });
} else {
  if (isDevelopment) {
    // else do nothing
    console.log("exit by app!");
  } else
     process.exit(configMain.getExitCode());
}

// ----------------------------------------------------------------------------------

