import { event, ipcMain } from 'electron';
import log from 'electron-log';
import * as ipcKeys from "../../common/ipcKeys";
import * as windows from '../windows';

// ----------------------------------------------------------------------------------

const logKey = "mainIpc-";

// ----------------------------------------------------------------------------------

export function registerListener() {
  ipcMain.on(ipcKeys.IPC_TGT_MAIN, listenMainChannel);
  log.debug(`${logKey}registerListener`);

}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  ipcMain.removeAllListeners(ipcKeys.IPC_TGT_MAIN);
  log.debug(`${logKey}unregisterListener`);
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, input, output) {
  //log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);
  log.debug(`${logKey}listenMainChannel: input=`, input);

  if (input.type === ipcKeys.IPC_STATE_READY)
    sendToRenderer(ipcKeys.IPC_STATE_READY, "from_main");
}

// ----------------------------------------------------------------------------------

export function sendToWorker(ipcType, payload) {
  const data = {
    type: ipcType,
    payload: payload
  }
  ipcMain.send(ipcKeys.IPC_TGT_RENDERER, data);
}

// ----------------------------------------------------------------------------------

export function sendToRenderer(ipcType, payload) {
  const data = {
    type: ipcType,
    payload: payload
  }

  const window = windows.getMainWindow();
  if (window)
    window.webContents.send(ipcKeys.IPC_TGT_RENDERER, data);
}

// ----------------------------------------------------------------------------------
