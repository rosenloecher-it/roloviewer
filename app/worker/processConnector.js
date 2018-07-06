import log from 'electron-log';
import * as ipc from "./workerIpc";
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "processConnector";

// ----------------------------------------------------------------------------------

export class ProcessConnector {

  constructor() {

    this.data = ProcessConnector.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);
  }

  // ........................................................

  static createDefaultData() {
    return {
    };
  }

  // ........................................................

  coupleObjects() {
    const func = ".init";
    log.debug(`${_logKey}${func}`);

    // dummy
  }

  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function(resolve, reject) {
      log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;

    // return dummy promise
    return new Promise(function(resolve) { resolve(); });
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function(resolve, reject) {
      log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  send(ipcTarget, ipcType, payload) {
    ipc.send(ipcTarget, ipcType, payload);
  }

  // ........................................................

  sendShowMessage(msgType, msgText) {
    ipc.sendShowMessage(msgType, msgText);
  }

  // ........................................................

}
