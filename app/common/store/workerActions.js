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
// open tasks

export const createActionOpenFolder = (container, selectFile = null) => ({
  type: constants.AR_WORKER_OPEN_FOLDER,
  payload: {
    containerType: constants.CONTAINER_FOLDER,
    container, // null == autoSelect
    selectFile,
  },
  taskId: getNextTaskId()
});

export const createActionOpenPlaylist = (container, selectFile = null) => ({
  type: constants.AR_WORKER_OPEN_PLAYLIST,
  payload: {
    containerType: constants.CONTAINER_PLAYLIST,
    container,
    selectFile,
  },
  taskId: getNextTaskId()
});

export const createActionOpenDropped = (files) => ({
  type: constants.AR_WORKER_OPEN_DROPPED,
  payload: {
    containerType: constants.CONTAINER_CLIPBOARD,
    files,
  },
  taskId: getNextTaskId()
});

export const createActionAutoSelect = () => ({
  type: constants.AR_WORKER_AUTO_SELECT,
  payload: {
    containerType: constants.CONTAINER_AUTOSELECT,
    container: null,    // not needed
    selectFile: null,   // not needed
  },
  taskId: getNextTaskId()
});

export const createActionDeliverMeta = (file) => ({
  type: constants.AR_WORKER_DELIVER_META,
  payload: {file},
  taskId: getNextTaskId()
});

// ----------------------------------------------------------------------------------
// crawler tasks

export const createActionStart = (lastContainerType = null, container = null, selectFile = null) => ({
  type: constants.AR_WORKER_START,
  payload: {
    lastContainerType,
    container,
    selectFile,
  },
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
