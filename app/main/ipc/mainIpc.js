import { event, ipcMain } from 'electron';
import log from 'electron-log';
import * as ipcKeys from "../../common/ipcKeys";
import * as windows from '../windows';

// ----------------------------------------------------------------------------------

const logKey = "mainIpc-";

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcMain.on(ipcKeys.IPC_TGT_MAIN, listenMainChannel);
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcMain.removeAllListeners(ipcKeys.IPC_TGT_MAIN);
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, input, output) {
  //log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);
  log.debug(`${logKey}listenMainChannel: input=`, input);

  if (input.type === ipcKeys.IPC_STATE_READY && input.payload === "from_renderer")
    sendToRenderer(ipcKeys.IPC_STATE_READY, "from_main");

  if (input.type === ipcKeys.IPC_STATE_READY && input.payload === "from_worker")
    sendToWorker(ipcKeys.IPC_STATE_READY, "from_main");

}

// ----------------------------------------------------------------------------------

export function sendToWorker(ipcType, payload) {
  const data = {
    type: ipcType,
    payload: payload
  }
  const window = windows.getWorkerWindow();
  if (window)
    window.webContents.send(ipcKeys.IPC_TGT_WORKER, data);
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
