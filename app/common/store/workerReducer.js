import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = 'workerReducer';

export const PRIO_LENGTH = 10;

// ----------------------------------------------------------------------------------

export class WorkerReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultTaskArray() {
    const tasks = [];

    for (let i = 0; i < PRIO_LENGTH; i++) tasks.push([]);

    return tasks;
  }

  static defaultState() {
    return {
      tasks: WorkerReducer.defaultTaskArray()
    };
  }

  // .....................................................

  reduce(state = WorkerReducer.defaultState(), action) {
    const func = '.reduce';
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_WORKER_REMOVE_TASK:
          return this.removeTask(state, action);

        case constants.AR_WORKER_REMOVE_TASKTYPES:
          return this.removeTaskTypes(state, action);

        case constants.AR_WORKER_REMOVE_ALL_TASKS:
          return { ...state, tasks: WorkerReducer.defaultTaskArray() };

        case constants.AR_WORKER_AUTO_SELECT:
        case constants.AR_WORKER_OPEN_DROPPED:
        case constants.AR_WORKER_OPEN_FOLDER:
        case constants.AR_WORKER_OPEN_PLAYLIST:
          return this.open(state, action);

        case constants.AR_WORKER_UPDATE_DIR:
          return this.updateDir(state, action);

        case constants.AR_WORKER_CRAWLER_FINALLY:
        case constants.AR_WORKER_DELIVER_META:
        case constants.AR_WORKER_PREPARE_DIRS_FOR_UPDATE:
        case constants.AR_WORKER_RATE_DIR_BY_FILE:
        case constants.AR_WORKER_REMOVE_DIRS:
        case constants.AR_WORKER_SEARCH_FOR_NEW_DIRS:
        case constants.AR_WORKER_START:
        case constants.AR_WORKER_UPDATE_DIRFILES:
          return this.pushGenericTask(state, action);

        default:
          return state;
      }
    } catch (err) {
      log.error(`${this._logKey}${func}(${actionType}) - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
      throw err;
    }
  }

  // .....................................................

  pushGenericTask(state, action) {
    const func = '.handleGenericTask';
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
    const func = '.open';
    //log.debug(`${this._logKey}${func} - in`, action);

    const newState = { ...state };

    const prio = WorkerReducer.getTaskPrio(action.type);
    if (prio < 0 || prio >= state.tasks.length) {
      log.error(`${this._logKey}${func} - unknown prio`, action);
      return state;
    }

    newState.tasks[prio] = [action];

    if (action.payload.container !== null) {
      // folder or playlist
      const prioMeta = WorkerReducer.getTaskPrio(
        constants.AR_WORKER_DELIVER_META
      );
      newState.tasks[prioMeta] = [];
    }

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

  updateDir(state, action) {
    if (WorkerReducer.existsUpdateDirTask(state, action.payload)) return state;

    return this.pushGenericTask(state, action);
  }

  static sliceItemFromArray(oldItems, index) {
    const newItems = [];

    for (let i = 0; i < oldItems.length; i++) {
      if (i !== index) newItems.push(oldItems[i]);
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
        if (currentTaskId === wantedTaskId) foundIndex = k;

        if (foundIndex >= 0) {
          const newState = { ...state };
          newState.tasks[i] = WorkerReducer.sliceItemFromArray(
            newState.tasks[i],
            foundIndex
          );
          return newState;
        }
      }
    }

    return state;
  }

  // .....................................................

  removeTaskTypes(state, action) {
    const func = '.removeTaskTypes';

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
      case constants.AR_WORKER_AUTO_SELECT:
      case constants.AR_WORKER_OPEN_DROPPED:
      case constants.AR_WORKER_OPEN_FOLDER:
      case constants.AR_WORKER_OPEN_PLAYLIST:
        return 0;
      case constants.AR_WORKER_DELIVER_META:
        return 1;
      case constants.AR_WORKER_START:
        return 2;
      case constants.AR_WORKER_REMOVE_DIRS:
        return 3;
      case constants.AR_WORKER_PREPARE_DIRS_FOR_UPDATE:
        return 4;
      case constants.AR_WORKER_SEARCH_FOR_NEW_DIRS:
        return 5;
      case constants.AR_WORKER_RATE_DIR_BY_FILE:
        return 6;
      case constants.AR_WORKER_UPDATE_DIRFILES:
        return 7;
      case constants.AR_WORKER_UPDATE_DIR:
        return 8;
      case constants.AR_WORKER_CRAWLER_FINALLY:
        return 9;
      default:
        return null;
    }
  }

  // .....................................................

  static existsUpdateDirTask(state, dir) {
    const prio = WorkerReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);

    const tasks = state.tasks[prio];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (dir === task.payload) {
        return true;
      }
    }

    return false;
  }

  // .....................................................

  static getNextTask(state) {
    for (let i = 0; i < state.tasks.length; i++) {
      const subtasks = state.tasks[i];
      if (subtasks.length > 0) return subtasks[0];
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
        if (currentTaskId === wantedTaskId) return true;
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
