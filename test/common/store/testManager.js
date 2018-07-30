import {WorkerManager} from "../../../app/worker/store/workerManager";
import {WorkerReducer} from "../../../app/common/store/workerReducer";


// ----------------------------------------------------------------------------------

const _logKey = "testManager"; // eslint-disable-line no-unused-vars

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
    const state = this.workerState;
    const {tasks} = state;

    if (!taskType) {
      for (let i = 0; i < tasks.length; i++)
        tasks[i] = [];
    } else {

      const prio = WorkerReducer.getTaskPrio(taskType);
      if (prio < 0 || prio >= tasks.length)
        throw new Error('(clearTasks) wrong task prio!');
      tasks[prio] = [];
    }
  }

  // ........................................................

  get tasks() {
    const state = this.workerState;

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

    const state = this.workerState;

    const count = WorkerReducer.countTasks(state);
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

  getLastGlobalAction(actionType = null) {

    const {globalDispatchedActions} = this.data;

    if (globalDispatchedActions.length <= 0)
      return null;

    if (!actionType) {
      return globalDispatchedActions[globalDispatchedActions.length - 1];
    }

    for (let i = globalDispatchedActions.length - 1; i >= 0; i--) {
      const action = globalDispatchedActions[i];
      if (action.type === actionType)
        return action;
    }

    return null;
  }

  // .....................................................

  clearGlobalActions() {
    this.data.globalDispatchedActions = [];
  }

  // .....................................................

  dispatchRemote(action) {

    // do nothing
    this.data.globalDispatchedActions.push(action);

  }

  // .....................................................

}

// ----------------------------------------------------------------------------------


