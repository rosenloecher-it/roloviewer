import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "crawlerReducer";

export const PRIO_MAX = 7;

// ----------------------------------------------------------------------------------

export class CrawlerReducer {
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
      batchCount: constants.DEFCONF_CRAWLER_BATCHCOUNT,
      database: null,
      folderBlacklist: [],
      folderBlacklistSnippets: [],
      folderSource: [],
      showRating: [],
      tagBlacklist: [],
      tagShow: [],
      tasksPrio1open: [],
      tasksPrio2meta: [],
      tasks: CrawlerReducer.defaultTaskArray()
    }
  }

  // .....................................................

  reduce(state = CrawlerReducer.defaultState(), action) {
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

        case constants.AR_CRAWLER_INIT:
          return this.init(state, action);

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

  init(state, action) {
    const func = ".init";

    const {
      batchCount, database,
      folderBlacklist, folderBlacklistSnippets, folderSource,
      showRating, tagBlacklist, tagShow,
    } = action.payload;

    const newState = {
      ...state,
      batchCount, database,
      folderBlacklist, folderBlacklistSnippets, folderSource,
      showRating, tagBlacklist, tagShow,
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
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

    let found = CrawlerReducer.findTaskIndex(state.tasksPrio1open, obsoleteAction);
    if (found >= 0) {
      newState = {
        ...state,
        tasksPrio1open: CrawlerReducer.sliceItemFromArray(state.tasksPrio1open, found),
      };
    } else {
      found = CrawlerReducer.findTaskIndex(state.tasksPrio2meta, obsoleteAction);
      if (found >= 0) {
        newState = {
          ...state,
          tasksPrio2meta: CrawlerReducer.sliceItemFromArray(state.tasksPrio2meta, found),
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

  static getNextTask(crawlerState) {

    let newTask = null;

    /* eslint-disable prefer-destructuring */
    if (crawlerState.tasksPrio1open.length > 0) {
      newTask = crawlerState.tasksPrio1open[0];
    } else if (crawlerState.tasksPrio2meta.length > 0) {
      newTask = crawlerState.tasksPrio2meta[0];
    }
    /* eslint-enable prefer-destructuring */

    return newTask;
  }

  // .....................................................

  static existsTask(crawlerState, task) {
    let found = -1;

    found = CrawlerReducer.findTaskIndex(crawlerState.tasksPrio1open, task);
    if (found >= 0)
      return true;
    else {
      found = CrawlerReducer.findTaskIndex(crawlerState.tasksPrio2meta, task);
      if (found >= 0)
        return true;
    }

    return false;
  }

  // ........................................................

  static countTasks(crawlerState) {

    let count = 0;

    count += crawlerState.tasksPrio1open.length;
    count += crawlerState.tasksPrio2meta.length;

    return count;
  }
}

