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
import * as ops from './mainOps';
import * as mainMenu from './mainMenu';
import * as windows from './windows';
import * as mainIpc from './mainIpc';
import * as powerSaveBlocker from "./powerSaveBlocker";
import Cli from "./config/cli";
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "main";

const _isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
const _isProduction = process.env.NODE_ENV === 'production';
const _isTest = process.env.NODE_ENV === 'test';
const _showDevTools = !_isProduction || process.env.DEBUG_PROD === 'true' || constants.DEBUG_DEVTOOLS_PROD;

let _cli = null;

// ----------------------------------------------------------------------------------

function allWindowsClosed() {

  log.debug(`${_logKey}.allWindowsClosed`);

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    ops.quitApp();
  }
}

// ----------------------------------------------------------------------------------

function onAppWillQuit() {
  log.debug(`${_logKey}.onAppWillQuit`);
  mainIpc.unregisterListener();
  config.saveConfig();
}

// ----------------------------------------------------------------------------------


_cli = new Cli(this);

// ----------------------------------------------------------------------------------

if (!_cli.shouldExit()) {

  config.initContext({ isDevelopment: _isDevelopment, isProduction: _isProduction, isTest: _isTest, showDevTools:_showDevTools });
  config.mergeConfig(_cli.result);

  if (_isProduction) {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (_isDevelopment) {
    require('electron-debug')();
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
  }

  ops.startCrashReporter();
  ops.configLogger();
  _cli.logCliArgs();
  _cli = null; // not needed any moore

  let installExtensions;

  if (_showDevTools) {
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
    if (installExtensions && _showDevTools) {
      await installExtensions();
    }

    mainIpc.registerListener();

    windows.createWorkerWindow();

    windows.createMainWindow();

    powerSaveBlocker.init();

  });
} else {

  if (_isDevelopment) {
    // else do nothing
    console.log(`${_logKey} - exit by app!`);
  } else
     process.exit(_cli.getExitCode());

}

// ----------------------------------------------------------------------------------

