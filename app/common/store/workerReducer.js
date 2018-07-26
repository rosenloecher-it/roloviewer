import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "workerReducer";

export const PRIO_LENGTH = 9;

// ----------------------------------------------------------------------------------

export class WorkerReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultTaskArray() {
    const tasks = [];

    for (let i = 0; i < PRIO_LENGTH; i++)
      tasks.push([]);

    return tasks;
  }

  static defaultState() {
    return {
      tasks: WorkerReducer.defaultTaskArray()
    }
  }

  // .....................................................

  reduce(state = WorkerReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {

        case constants.AR_WORKER_REMOVE_TASK:
          return this.removeTask(state, action);

        case constants.AR_WORKER_REMOVE_TASKTYPES:
          return this.removeTaskTypes(state, action);

        case constants.AR_WORKER_OPEN:
          return this.open(state, action);

        case constants.AR_WORKER_DELIVER_META:
        case constants.AR_WORKER_START:
        case constants.AR_WORKER_RATE_DIR_BY_FILE:
        case constants.AR_WORKER_RELOAD_DIRS:
        case constants.AR_WORKER_REMOVE_DIRS:
        case constants.AR_WORKER_SCAN_FSDIR:
        case constants.AR_WORKER_UPDATE_DIR:
        case constants.AR_WORKER_UPDATE_FILES:
          return this.pushGenericTask(state, action);

        default:
          return state;
      }

    } catch (err) {
      log.error(`${this._logKey}${func}(${actionType}) - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  pushGenericTask(state, action) {
    const func = ".handleGenericTask";
    //log.debug(`${this._logKey}${func} - in`, action);

    const prio = WorkerReducer.getTaskPrio(action.type);

    if (prio < 0 || prio >= state.tasks.length) {
      log.error(`${this._logKey}${func} - unknown prio`, action);
      return state;
    }

    const newState = { ...state };
    newState.tasks[prio].push(action);

    return newState;
  }

  // .....................................................

  open(state, action) {
    const func = ".open";
    //log.debug(`${this._logKey}${func} - in`, action);

    const newState = { ...state };

    const prioOpen = WorkerReducer.getTaskPrio(constants.AR_WORKER_OPEN);
    newState.tasks[prioOpen] = [action];

    if (action.payload.container !== null) { // folder or playlist
      const prioMeta = WorkerReducer.getTaskPrio(constants.AR_WORKER_DELIVER_META);
      newState.tasks[prioMeta] = [];
    }

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

  static sliceItemFromArray(oldItems, index) {

    const newItems = [];

    for (let i = 0; i < oldItems.length; i++) {
      if (i !== index)
        newItems.push(oldItems[i]);
    }

    return newItems;
  }

  // .....................................................

  removeTask(state, action) {

    const obsoleteAction = action.payload;
    const wantedTaskId = obsoleteAction.taskId;

    for (let i = 0; i < state.tasks.length; i++) {
      const subtasks = state.tasks[i];

      for (let k = 0; k < subtasks.length; k++) {
        const currentTaskId = subtasks[k].taskId;
        let foundIndex = -1;
        if (currentTaskId === wantedTaskId)
          foundIndex = k;

        if (foundIndex >= 0) {
          const newState = { ...state };
          newState.tasks[i] = WorkerReducer.sliceItemFromArray(newState.tasks[i], foundIndex);
          return newState;
        }

      }
    }

    return state;
  }


  // .....................................................

  removeTaskTypes(state, action) {
    const func = ".removeTaskTypes";

    const prio = WorkerReducer.getTaskPrio(action.payload);

    if (prio < 0 || prio >= state.tasks.length) {
      log.error(`${this._logKey}${func} - unknown prio`, action);
      return state;
    }

    const newState = { ...state };
    newState.tasks[prio] = [];

    return newState;
  }


  // .....................................................

  static getTaskPrio(taskType) {

    switch (taskType) {
      case constants.AR_WORKER_OPEN:
        return 0;
      case constants.AR_WORKER_DELIVER_META:
        return 1;
      case constants.AR_WORKER_START:
        return 2;
      case constants.AR_WORKER_REMOVE_DIRS:
        return 3;
      case constants.AR_WORKER_RELOAD_DIRS:
        return 4;
      case constants.AR_WORKER_SCAN_FSDIR:
        return 5;
      case constants.AR_WORKER_RATE_DIR_BY_FILE:
        return 6;
      case constants.AR_WORKER_UPDATE_FILES:
        return 7;
      case constants.AR_WORKER_UPDATE_DIR:
        return 8;
      default:
        return null;
    }
  }

  // .....................................................

  static getNextTask(state) {

    for (let i = 0; i < state.tasks.length; i++) {
      const subtasks = state.tasks[i];
      if (subtasks.length > 0)
        return subtasks[0];
    }

    return null;
  }

  // .....................................................

  static existsTask(state, task) {

    const wantedTaskId = task.taskId;

    for (let i = 0; i < state.tasks.length; i++) {
      const subtasks = state.tasks[i];

      for (let k = 0; k < subtasks.length; k++) {
        const currentTaskId = subtasks[k].taskId;
        if (currentTaskId === wantedTaskId)
          return true;
      }
    }

    return false;
  }

  // ........................................................

  static countTasks(state) {

    let count = 0;

    for (let i = 0; i < state.tasks.length; i++) {
      const subtasks = state.tasks[i];
      count += subtasks.length;
    }

    return count;
  }
}

