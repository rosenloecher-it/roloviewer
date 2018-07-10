import log from 'electron-log';
import deepmerge from 'deepmerge';
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "taskManager";

// ----------------------------------------------------------------------------------

export class TaskManager {

  constructor() {

    this.data = TaskManager.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);

    this.pullTask = this.pullTask.bind(this);
    this.pushTask = this.pushTask.bind(this);
    this.clearTasks = this.clearTasks.bind(this);
  }

  // ........................................................

  static createDefaultData() {
     const data = {
      dbWrapper: null,
      tasks: []
    };

    const prioMax = TaskManager.getPrio(constants.ACTION_CRAWLE_START_NEW);

    for (let i = 0; i <= prioMax; i++)
       data.tasks[i] = [];

    console.log("data.tasks.length", data.tasks.length);

    return data;
  }

  // ........................................................

  coupleObjects(input) {
    const func = ".init";
    log.debug(`${_logKey}${func}`);

    this.data.config = input.config;
    this.data.dbWrapper = input.dbWrapper;
  }
  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function initPromise(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function shutdownPromise(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  static getPrio(taskType) {

    switch (taskType) {
      case constants.ACTION_DUMMY_TASK:
      case constants.ACTION_OPEN:
      case constants.ACTION_OPEN_ITEM_FOLDER:
        return PRIO_OPEN;
      case constants.AR_SLIDESHOW_DELIVER_FILE_META:
        return PRIO_DELIVER_FILE_META;
      case constants.ACTION_CRAWLE_UPDATE_FILE:
        return 2;
      case constants.ACTION_CRAWLE_EVAL_FOLDER:
        return 3;
      case constants.ACTION_CRAWLE_UPDATE_FOLDER:
        return 4;
      case constants.ACTION_CRAWLE_START_NEW:
        return 5;

      default:
        return null;
    }
  }

  // ........................................................

  exportTasks() {
    const clone = deepmerge.all([ this.data.tasks, {} ]);
    return clone;
  }

  // ........................................................

  getTaskCount() {
    let count = 0;

    const {tasks} = this.data;
    for (let i = 0; i < tasks.length; i++) {
      count += tasks[i].length;
    }

    return count;
  }

  // ........................................................

  restore() {
    const func = ".restore";

    const p = new Promise(function restorePromise(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  persist() {
    const func = ".persist";

    const p = new Promise(function persistPromise(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  pullTask() {
    const {tasks} = this.data;

    for (let i = 0; i < tasks.length; i++) {
      const prioQueue = tasks[i];
      if (prioQueue.length > 0) {
        const task = prioQueue[0];
        prioQueue.shift();
        return task;
      }
    }

    return null;
  }

  // ........................................................

  pushTask(task) {
    //{ type, payload }

    const clone = deepmerge.all([ task, {} ]);

    const prio = TaskManager.getPrio(clone.type);
    if (prio === null || prio < 0)
      throw new Error(`No task prio for action ${clone.type}!`);

    const {tasks} = this.data;

    if (prio === PRIO_OPEN) {
      tasks[PRIO_OPEN] = [];
      tasks[PRIO_DELIVER_FILE_META] = [];
    }

    const prioQueue = tasks[prio];
    prioQueue.push(clone);
  }

  // ........................................................

  clearTasks(taskType) {
    const prio = TaskManager.getPrio(taskType);
    if (prio !== null || prio >= 0) {
      this.data.tasks[prio] = [];
    }
  }

}

// ----------------------------------------------------------------------------------

export const PRIO_OPEN = 0;
export const PRIO_DELIVER_FILE_META = 1;

// ----------------------------------------------------------------------------------
