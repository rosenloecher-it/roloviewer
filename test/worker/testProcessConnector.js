import {ProcessConnector} from "../../app/worker/processConnector";
import * as ipc from "../../app/worker/workerIpc";
import * as constants from "../../app/common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "testProcessConnector";

// ----------------------------------------------------------------------------------

export class TestProcessConnector extends ProcessConnector {

  constructor() {
    super();

    this.data = TestProcessConnector.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);
  }

  // ........................................................

  static createDefaultData() {

    const data = super.createDefaultData();

    data.messages = [];

    return data;
  }

  // ........................................................

  send(ipcTarget, ipcType, payload) {

    const message = ipc.createIpcMessage(TestProcessConnector.constructor.name, ipcTarget, ipcType, payload);

    this.data.messages.push(message);

  }

  // ........................................................

  sendShowMessage(msgType, msgText) {

    const message = ipc.createIpcShowMessage(TestProcessConnector.constructor.name, msgType, msgText);

    this.data.messages.push(message);
  }

  // ........................................................

  clearMessages() {
    this.data.messages = [];
  }

  // ........................................................

  get messages() { return this.data.messages; }

  // ........................................................

}
