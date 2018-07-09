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
import storeManager from './store/mainManager';
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
const _isDevTool = !_isProduction || process.env.DEBUG_PROD === 'true' || constants.DEBUG_DEVTOOLS_PROD;

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
  try {
    log.debug(`${_logKey}.onAppWillQuit`);
    mainIpc.unregisterListener();
    config.saveConfig();

  } catch (err) {
    log.error(`${_logKey}.onAppWillQuit - exception -`, err);
  }
}

// ----------------------------------------------------------------------------------

function startApp(cli) {

  storeManager.init({
    isDevelopment: _isDevelopment,
    isProduction: _isProduction,
    isTest: _isTest,
    isDevTool: _isDevTool
  }, cli.result);

  storeManager.loadIni();


  config.mergeConfig(cli.result,
    { isDevelopment: _isDevelopment, isProduction: _isProduction, isTest: _isTest, isDevTool:_isDevTool });

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
  cli.logCliArgs();

  let installExtensions;

  if (_isDevTool) {
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
    if (installExtensions && _isDevTool) {
      await installExtensions();
    }

    mainIpc.registerListener();

    windows.createWorkerWindow();

    windows.createMainWindow();

    powerSaveBlocker.init();

  });

}

// ----------------------------------------------------------------------------------

function bootApp() {

  try {

    const cli = new Cli(this);
    const args = (_isProduction ? process.argv : constants.DEBUG_ARGS);
    cli.parseArray(args);

    if (!cli.shouldExit()) {
      startApp(cli);
    } else {

      if (_isDevelopment) {
        // else do nothing
        console.log(`${_logKey} - exit by app!`);
      } else
        process.exit(cli.getExitCode());

    }

  } catch (err) {
    console.log(`${_logKey}.bootupApp - exception -`, err);
    throw (err);
  }


}

// ----------------------------------------------------------------------------------

bootApp();

