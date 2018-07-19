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
  type: constants.AR_WORKER_STATUS_UPDATE,
  taskId: getNextTaskId()
});

export const createActionDirsRemoveNonExisting = () => ({
  type: constants.AR_WORKER_DIRS_REMOVE_NON_EXISTING,
  taskId: getNextTaskId()
});

export const createActionDirRemoveNonExisting = (file) => ({
  type: constants.AR_WORKER_DIR_REMOVE_NON_EXISTING,
  payload: {file},
  taskId: getNextTaskId()
});

export const createActionFilesUpdate = (folder, fileNames) => ({
  type: constants.AR_WORKER_FILES_UPDATE,
  payload: {
    folder,
    fileNames, // array of fileNames (without leading path)
  },
  taskId: getNextTaskId()
});


export const createActionDirUpdate = (file) => ({
  type: constants.AR_WORKER_DIR_UPDATE,
  payload: {file},
  taskId: getNextTaskId()
});


