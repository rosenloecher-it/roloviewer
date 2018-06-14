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
import { app } from 'electron';
import log from 'electron-log';
import path from 'path';
import config from './config/mainConfig';
import * as operations from './mainOps';
import * as mainMenu from './mainMenu';
import * as windows from './windows';
import * as mainIpc from './mainIpc';

// ----------------------------------------------------------------------------------

const logKey = "main";

// ----------------------------------------------------------------------------------

function allWindowsClosed() {

  log.debug(`${logKey}.allWindowsClosed`);

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    operations.quitApp();
  }
}

// ----------------------------------------------------------------------------------

function onAppWillQuit() {
  log.debug(`${logKey}.onAppWillQuit`);
  mainIpc.unregisterListener();
  config.saveConfig();
}

// ----------------------------------------------------------------------------------

config.initContext(process.env.NODE_ENV, process.env.DEBUG_PROD);

config.parseArgs();

// ----------------------------------------------------------------------------------

if (!config.shouldExit()) {

  config.mergeConfig();

  if (config.isProduction()) {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (config.isDevelopment()) {
    require('electron-debug')();
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
  }

  operations.startCrashReporter();
  operations.configLogger();

  let installExtensions;

  if (config.showDevTools()) {
    installExtensions = async () => {
      const installer = require('electron-devtools-installer');
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

      return Promise.all(
        extensions.map(name => installer.default(installer[name], forceDownload))
      ).catch(console.log);
    };
  }

  mainMenu.createMenu();

  app.on('window-all-closed', allWindowsClosed);
  app.on('will-quit', onAppWillQuit);


  app.on('ready', async () => {
    if (config.showDevTools()) {
      await installExtensions();
    }

    mainIpc.registerListener();

    windows.createWorkerWindow();

    windows.createMainWindow();

  });
} else {

  if (config.isDevelopment()) {
    // else do nothing
    console.log("exit by app!");
  } else
     process.exit(config.getExitCode());

}

// ----------------------------------------------------------------------------------

