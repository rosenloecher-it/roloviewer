import deepmerge from 'deepmerge';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

let _currentTaskId = 1;

function getNextTaskId() {
  return _currentTaskId++;
}

// ----------------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------------
// crawler tasks

export const createActionOpen = (container = null, selectFile = null) => ({
  type: constants.AR_WORKER_OPEN,
  payload: {
    container, // null == autoSelect
    selectFile,
  },
  taskId: getNextTaskId()
});


export const createActionDeliverMeta = (file) => ({
  type: constants.AR_WORKER_DELIVER_META,
  payload: {file},
  taskId: getNextTaskId()
});

export const createActionInitCrawler = () => ({
  type: constants.AR_WORKER_INIT_CRAWLE,
  taskId: getNextTaskId()
});

export const createActionRemoveDir = (dir) => ({
  type: constants.AR_WORKER_REMOVE_DIRS,
  payload: { dirs: [dir] },
  taskId: getNextTaskId()
});

export const createActionRemoveDirs = (dirs) => ({
  type: constants.AR_WORKER_REMOVE_DIRS,
  payload: {dirs},
  taskId: getNextTaskId()
});

export const createActionScanFsDir = (dir) => ({
  type: constants.AR_WORKER_SCAN_FSDIR,
  payload: dir,
  taskId: getNextTaskId()
});

export const createActionReloadDirs = (rescanAll = false) => ({
  type: constants.AR_WORKER_RELOAD_DIRS,
  payload: { rescanAll },
  taskId: getNextTaskId()
});

export const createActionRateDirByFile = (file) => ({
  type: constants.AR_WORKER_RATE_DIR_BY_FILE,
  payload: file,
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

export const createActionUpdateDir = (dir) => ({
  type: constants.AR_WORKER_UPDATE_DIR,
  payload: dir,
  taskId: getNextTaskId()
});
