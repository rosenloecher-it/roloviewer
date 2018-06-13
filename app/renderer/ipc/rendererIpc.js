import log from 'electron-log';
import {ipcRenderer} from 'electron';
import * as ipcKeys from "../../common/ipcKeys";

// ----------------------------------------------------------------------------------

const logKey = "rendererIpc-";

// ----------------------------------------------------------------------------------

export function registerListener() {
  //log.debug(`${logKey}registerListener`);
  ipcRenderer.on(ipcKeys.IPC_TGT_RENDERER, listenRendererChannel);

  sendToMain(ipcKeys.IPC_STATE_READY, "from_renderer");
}

// ----------------------------------------------------------------------------------

export function unregisterListener() {
  //log.debug(`${logKey}unregisterListener`);
  ipcRenderer.removeAllListeners(ipcKeys.IPC_TGT_MAIN);
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

