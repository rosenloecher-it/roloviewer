import log from 'electron-log';
import * as constants from "../../../app/common/constants";
import {ContextReducer} from "../../../app/common/store/contextReducer";
import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";
import {MainWindowReducer} from "../../../app/common/store/mainWindowReducer";
import {MessageReducer} from "../../../app/common/store/messageReducer";
import {SlideshowReducer} from "../../../app/common/store/slideshowReducer";
import {StoreManager} from "../../../app/common/store/storeManager";
import {SystemReducer} from "../../../app/common/store/systemReducer";
import {WorkerManager} from "../../../app/worker/store/workerManager";
import {CrawlerTasksReducer, PRIO_LENGTH} from "../../../app/common/store/crawlerTasksReducer";


// ----------------------------------------------------------------------------------

const _logKey = "testManager";

// ----------------------------------------------------------------------------------

export class TestManager extends WorkerManager {

  constructor() {
    super();

    this.data = {
      globalDispatchedActions: []
    };
  }

  // ........................................................

  clearTasks(taskType = null) {
    const state = this.crawlerTasksState;
    const {tasks} = state;

    if (!taskType) {
      for (let i = 0; i < tasks.length; i++)
        tasks[i] = [];
    } else {

      const prio = CrawlerTasksReducer.getTaskPrio(taskType);
      if (prio < 0 || prio >= tasks.length)
        throw new Error('(clearTasks) wrong task prio!');
      tasks[prio] = [];
    }
  }

  // ........................................................

  get tasks() {
    const state = this.crawlerTasksState;

    const actions = [];

    for (let i = 0; i < state.tasks.length; i++) {
      const tasks = state.tasks[i];
      for (let k = 0; k < tasks.length; k++) {
        actions.push(tasks[k]);
      }
    }

    return actions;
  }

  // ........................................................

  countTasks() {

    const state = this.crawlerTasksState;

    const count = CrawlerTasksReducer.countTasks(state);
    return count;
  }

  // .....................................................

  countTypeTasks(type) {

    const tasks = this.tasks;

    let count = 0;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].type === type)
        count++;
    }

    return count;
  }

  // .....................................................

  // dispatchTask(action) {
  //   const func = 'dispatchTask';
  //
  //   super.dispatchLocal(action);
  //
  //   log.info(`${_logKey}${func} - in - action:`, action);
  // }

  // .....................................................

  clearGlobalActions() {
    this.data.globalDispatchedActions = [];
  }

  // .....................................................

  dispatchRemote(action, destinationsIn = null) {

    // do nothing
    this.data.globalDispatchedActions.push(action);

  }

  // .....................................................

  // dispatchLocal(action) {
  //   this.data.dispatchedActions.push(action);
  // }
  //
  // // .....................................................
  //
  // dispatchRemote(action) {
  //   this.dispatchLocal(action);
  // }
  //
  // // ........................................................
  //
  // dispatchGlobal(action) {
  //   this.dispatchLocal(action);
  // }
  //
  // dispatchTask(action) {
  //   this.dispatchLocal(action);
  // }
}

// ----------------------------------------------------------------------------------

const _instanceTestManager = new TestManager();

export default _instanceTestManager;
