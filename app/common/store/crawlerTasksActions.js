import deepmerge from 'deepmerge';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

let _currentTaskId = 1;

function getNextTaskId() {
  return _currentTaskId++;
}

// ----------------------------------------------------------------------------------

export const createActionOpen = (container = null, selectFile = null, trailNumber = 1) => ({
  type: constants.AR_WORKER_OPEN,
  payload: {
    container, // null == autoSelect
    selectFile,
    trailNumber, // file action again, when auto-selction fails
  },
  taskId: getNextTaskId()
});

export const createActionRemoveTask = (obsoleteAction) => ({
  type: constants.AR_WORKER_REMOVE_TASK,
  payload: deepmerge.all([ obsoleteAction, {} ]),
  //payload: obsoleteAction
  taskId: getNextTaskId()
});

export const createActionRemoveTaskTypes = (taskType) => ({
  type: constants.AR_WORKER_REMOVE_TASKTYPES,
  payload: taskType,
  taskId: getNextTaskId()
});

export const createActionDeliverMeta = (file) => ({
  type: constants.AR_WORKER_DELIVER_META,
  payload: {file},
  taskId: getNextTaskId()
});

export const createActionCrawlerStart = () => ({
  type: constants.AR_WORKER_INIT_CRAWLE,
  taskId: getNextTaskId()
});

export const createActionRemoveDir = (file) => ({
  type: constants.AR_WORKER_REMOVE_DIR,
  payload: {file},
  taskId: getNextTaskId()
});

export const createActionUpdateFiles = (folder, fileNames) => ({
  type: constants.AR_WORKER_UPDATE_FILES,
  payload: {
    folder,
    fileNames, // array of fileNames (without leading path)
  },
  taskId: getNextTaskId()
});

export const createActionUpdateDir = (file) => ({
  type: constants.AR_WORKER_UPDATE_DIR,
  payload: {file},
  taskId: getNextTaskId()
});


