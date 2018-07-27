/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `.app/dist/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app } from 'electron';
import log from 'electron-log';
import path from 'path';
import storeManager from './store/mainManager';
import * as ops from './mainOps';
import * as mainMenu from './mainMenu';
import * as windows from './windows';
import * as ipc from './mainIpc';
import * as powerSaveBlocker from "./powerSaveBlocker";
import Cli from "./cli";
import * as constants from "../common/constants";
import * as fileTools from "../common/utils/fileUtils";

// ----------------------------------------------------------------------------------

const _logKey = "main";

const _isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
const _isProduction = process.env.NODE_ENV === 'production';
const _isTest = process.env.NODE_ENV === 'test';
const _isDevtool = !_isProduction || process.env.DEBUG_PROD === 'true' || constants.DEBUG_DEVTOOLS_PROD;

// ----------------------------------------------------------------------------------

function allWindowsClosed() {

  log.debug(`${_logKey}.allWindowsClosed`);

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    ops.quittingApp();
  }
}

// ----------------------------------------------------------------------------------

function onAppWillQuit() {
  const func = '.onAppWillQuit';

  try {
    storeManager.saveIniFile();

  } catch (err) {
    log.error(`${_logKey}${func} -`, err);
  }
}

// ----------------------------------------------------------------------------------

function startApp(cli) {

  storeManager.init({
    isDevelopment: _isDevelopment,
    isProduction: _isProduction,
    isTest: _isTest,
    isDevtool: _isDevtool
  }, cli.result);

  storeManager.loadIniFile();

  ops.configLogger();
  cli.logCliArgs();

  process.on('uncaughtException', function (err) {
    log.error(`${_logKey}.uncaughtException -`, err);
  });

  if (_isProduction) {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (_isDevelopment) {
    require('electron-debug')();
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
  }

  let installExtensions;

  if (_isDevtool) {
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
    if (installExtensions && _isDevtool) {
      await installExtensions();
    }

    ipc.initIpc();
    storeManager.sender = ipc;

    windows.createWorkerWindow();

    windows.createMainWindow();

    powerSaveBlocker.init();

  });

}

// ----------------------------------------------------------------------------------

function bootApp() {

  try {

    const defaultConfigFile = fileTools.getDefaultConfigFile(_isProduction);
    const cli = new Cli(defaultConfigFile);
    const args = (_isProduction ? process.argv : constants.DEBUG_ARGS);
    cli.parseArray(args);

    if (!cli.shouldExit()) {
      startApp(cli);
    } else {

      if (_isDevelopment) {
        // else do nothing
        console.log(`${_logKey} - exit by app (#${cli.exitCode})!`);
      } else
        process.exit(cli.exitCode);

    }

  } catch (err) {
    console.log(`${_logKey}.bootupApp - exception -`, err);
    throw (err);
  }


}

// ----------------------------------------------------------------------------------

bootApp();

