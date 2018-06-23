import log from 'electron-log';
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "dispatcher";

// ----------------------------------------------------------------------------------

export class Dispatcher {

  constructor() {

    this.data = Dispatcher.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);

    this.sendMsg = this.sendMsg.bind(this);
    this.addTask = this.addTask.bind(this);
    this.processTask = this.processTask.bind(this);

  }

  // ........................................................

  static createDefaultData() {
    return {
      config: null,
      mediaCrawler: null,
      mediaLoader: null,
      metaReader: null,
      processConnector: null,
      taskManager: null
    };
  }

  // ........................................................

  coupleObjects(input) {
    const func = ".coupleObjects";
    log.silly(`${_logKey}${func}`);

    this.data.config = input.config;
    this.data.mediaCrawler = input.mediaCrawler;
    this.data.mediaLoader = input.mediaLoader;
    this.data.metaReader = input.metaReader;
    this.data.processConnector = input.processConnector;
    this.data.taskManager = input.taskManager;
  }

  // ........................................................

  init() {
    const func = ".init";
    log.silly(`${_logKey}${func}`);

    this.sendMsg(constants.IPC_MAIN, constants.ACTION_READY, null);

    // return dummy promise
    return new Promise(function(resolve) { resolve(); });
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";
    log.silly(`${_logKey}${func}`);

    this.data = Dispatcher.createDefaultData();

    // return dummy promise
    return new Promise(function(resolve) { resolve(); });
  }

  // ........................................................

  sendMsg(ipcTarget, ipcType, payload) {

    this.data.processConnector.send(ipcTarget, ipcType, payload);
  }

  // ........................................................

  addTask(ipcMsg) {
    // return false if cannot be handled

    switch (ipcMsg.type) { // eslint-disable-line default-case
      case constants.ACTION_OPEN:
        this.data.taskManager.pushTask(ipcMsg);
        break;
      case constants.ACTION_DUMMY_TASK:
        this.data.taskManager.pushTask(ipcMsg);
        break;
      case constants.ACTION_NEXT_TASK:
        break;

      default:
        return false; // task is not handled!
    }

    this.processTask();

    return true;
  }

  // ........................................................

  processTask() {
    const func = ".processTask";

    const instance = this;

    if (!instance.data)
      log.error(`${_logKey}${func} - instance.data is null or undefined`);
    if (!instance.data.taskManager)
      log.error(`${_logKey}${func} - instance.data.taskManager is null or undefined`);

    const task = instance.data.taskManager.pullTask();

    if (task) {

      const p = new Promise(function(resolve, reject) {
        //log.debug(`${_logKey}${func} - inside promise`, task);

        switch (task.type) { // eslint-disable-line default-case

          case constants.ACTION_DELIVER_FILE_META:
            instance.data.metaReader.deliverMeta(task.payload); break;

          case constants.ACTION_CRAWLE_UPDATE_FILE:
            instance.data.mediaCrawler.updateFile(task.payload); break;
          case constants.ACTION_CRAWLE_EVAL_FOLDER:
            instance.data.mediaCrawler.evalFolder(task.payload); break;
          case constants.ACTION_CRAWLE_UPDATE_FOLDER:
            instance.data.mediaCrawler.updateFolder(task.payload); break;
          case constants.ACTION_CRAWLE_START_NEW:
            instance.data.mediaCrawler.startNew(); break;

          case constants.ACTION_OPEN:
            instance.data.mediaLoader.open(task.payload); break;

          case constants.ACTION_DUMMY_TASK:
            log.debug(`${_logKey}${func} - ${task.type}`); break;

          //ACTION_NEXT_TASK is not valid task!
          default:
            reject(new Error("unknown task type!"));
        }

        resolve();
      });

      instance.processTask();

      p.catch((error) => {
        log.error(`${_logKey}${func} - `, error);
        instance.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, "Error ${_logKey}${func} - ", task);
      });
    }


  }

  // ........................................................


}

// ----------------------------------------------------------------------------------
