import { ipcMain } from 'electron';
import log from 'electron-log';
import * as ipcKeys from "../common/ipcKeys";

// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------

export function registerListener() {
  //ipcMain.on(ipcKeys.IPC_TGT_MAIN, listenMainChannel);
  log.debug("registerListener");

}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //ipcMain.removeAllListeners(ipcKeys.IPC_TGT_MAIN);
  log.debug("unregisterListener");
}

// ----------------------------------------------------------------------------------

function listenMainChannel(event, input, output) {
  log.debug("listenMainChannel: event=", event, "; input=", input, "; output=", output);


}

// ----------------------------------------------------------------------------------

export function sendToWorker(ipcKey, payload) {

}

// ----------------------------------------------------------------------------------

export function sendToRenderer(ipcKey, payload) {

}

// ----------------------------------------------------------------------------------
