import log from 'electron-log';
import * as constants from "../common/constants";
import * as ipc from "./rendererIpc";
import config from "./rendererConfig";

// ----------------------------------------------------------------------------------

const logKey = "rendererOps";

// ----------------------------------------------------------------------------------

export function showMessage(ipcMsg) {

  log.debug(`${logKey}.showMessage:`);

}

// ----------------------------------------------------------------------------------

export function showFiles(ipcMsg) {


  log.debug(`${logKey}.showFiles:`);
}

// ----------------------------------------------------------------------------------
