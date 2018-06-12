import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as ipcKeys from "../../common/ipcKeys";

// ----------------------------------------------------------------------------------

const logKey = "rendererIpc-";

// ----------------------------------------------------------------------------------

export function registerListener() {
  ipcRenderer.on(ipcKeys.IPC_TGT_RENDERER, listenRendererChannel);
  log.debug(`${logKey}registerListener`);

  sendToMain(ipcKeys.IPC_STATE_READY, "registerListener");
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  ipcRenderer.removeAllListeners(ipcKeys.IPC_TGT_MAIN);
  log.debug("unregisterListener");
  log.debug(`${logKey}registerListener`);
}

// ----------------------------------------------------------------------------------

function listenRendererChannel(event, input, output) {
  //log.debug("listenRendererChannel: event=", event, "; input=", input, "; output=", output);
  log.debug(`${logKey}listenRendererChannel: input=`, input);

  //sendToMain(ipcKeys.IPC_STATE_READY, "listenRendererChannel");
}

// ----------------------------------------------------------------------------------

export function sendToMain(ipcType, payload) {
  const data = {
    type: ipcType,
    payload: payload
  }
  ipcRenderer.send(ipcKeys.IPC_TGT_MAIN, data);
}

// ----------------------------------------------------------------------------------

