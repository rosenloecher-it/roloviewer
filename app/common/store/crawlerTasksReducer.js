import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "crawlerTasksReducer";

export const PRIO_MAX = 7;

// ----------------------------------------------------------------------------------

export class CrawlerTasksReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultTaskArray() {
    const tasks = [];

    for (let i = 0; i <= PRIO_MAX; i++)
      tasks.push([]);

    return tasks;
  }

  static defaultState() {
    return {
      tasksPrio1open: [],
      tasksPrio2meta: [],
      tasks: CrawlerTasksReducer.defaultTaskArray()
    }
  }

  // .....................................................

  reduce(state = CrawlerTasksReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {

        case constants.AR_CRAWLER_T2_DELIVER_META:
          return this.deliverMeta(state, action);

        case constants.AR_CRAWLER_REMOVE_TASK:
          return this.removeTask(state, action);

        case constants.AR_CRAWLER_T1_OPEN:
          return this.open(state, action);

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

  open(state, action) {
    const func = ".open";
    //log.debug(`${this._logKey}${func} - in`, action);

    const newState = {
      ...state,
      tasksPrio1open: [action],
    };

    if (action.payload.container !== null)  // folder or playlist
      newState.tasksPrio2meta = [];

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

  deliverMeta(state, action) {
    const func = ".deliverMeta";
    //log.debug(`${this._logKey}${func} - in`, action);

    const newState = {
      ...state,
      tasksPrio2meta: state.tasksPrio2meta.concat(action),
    };

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

    let newState = null;

    let found = CrawlerTasksReducer.findTaskIndex(state.tasksPrio1open, obsoleteAction);
    if (found >= 0) {
      newState = {
        ...state,
        tasksPrio1open: CrawlerTasksReducer.sliceItemFromArray(state.tasksPrio1open, found),
      };
    } else {
      found = CrawlerTasksReducer.findTaskIndex(state.tasksPrio2meta, obsoleteAction);
      if (found >= 0) {
        newState = {
          ...state,
          tasksPrio2meta: CrawlerTasksReducer.sliceItemFromArray(state.tasksPrio2meta, found),
        };
      }

    }

    //log.debug(`${this._logKey}${func} - out`, action);

    if (newState !== null)
      return newState;

    return state;
  }

  // .....................................................

  static getTaskPrio(taskType) {

    switch (taskType) {
      case constants.AR_CRAWLER_T1_OPEN:
        return 0;
      case constants.AR_CRAWLER_T2_DELIVER_META:
        return 1;
      case constants.AR_CRAWLER_T3_CHECK_STATUS:
        return 2;
      case constants.AR_CRAWLER_T4_RECALC_DIR:
        return 3;
      case constants.AR_CRAWLER_T5_DIR_META:
        return 4;
      case constants.AR_CRAWLER_T6_UPDATE_DIR:
        return 5;

      default:
        return null;
    }
  }

  // .....................................................

  static findTaskIndex(tasks, task) {

    if (task && task.payload && task.payload.taskId >= 0) {
      const {taskId} = task.payload;
      for (let i = 0; i < tasks.length; i++) {
        if (taskId === tasks[i].payload.taskId)
          return i;
      }
    }

    return -1;
  }

  // .....................................................

  static getNextTask(state) {

    let newTask = null;

    /* eslint-disable prefer-destructuring */
    if (state.tasksPrio1open.length > 0) {
      newTask = state.tasksPrio1open[0];
    } else if (state.tasksPrio2meta.length > 0) {
      newTask = state.tasksPrio2meta[0];
    }
    /* eslint-enable prefer-destructuring */

    return newTask;
  }

  // .....................................................

  static existsTask(state, task) {
    let found = -1;

    found = CrawlerTasksReducer.findTaskIndex(state.tasksPrio1open, task);
    if (found >= 0)
      return true;
    else {
      found = CrawlerTasksReducer.findTaskIndex(state.tasksPrio2meta, task);
      if (found >= 0)
        return true;
    }

    return false;
  }

  // ........................................................

  static countTasks(taskState) {

    let count = 0;

    count += taskState.tasksPrio1open.length;
    count += taskState.tasksPrio2meta.length;

    return count;
  }
}

