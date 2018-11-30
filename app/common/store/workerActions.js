import deepmerge from 'deepmerge';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

let _currentTaskId = 1;

function getNextTaskId() {
  return _currentTaskId++;
}

// ----------------------------------------------------------------------------------

export const createActionRemoveTask = obsoleteAction => ({
  type: constants.AR_WORKER_REMOVE_TASK,
  payload: deepmerge.all([obsoleteAction, {}]),
  //payload: obsoleteAction
  taskId: getNextTaskId()
});

export const createActionRemoveTaskTypes = taskType => ({
  type: constants.AR_WORKER_REMOVE_TASKTYPES,
  payload: taskType,
  taskId: getNextTaskId()
});

export const createActionRemoveAllTasksTypes = () => ({
  type: constants.AR_WORKER_REMOVE_ALL_TASKS,
  payload: null,
  taskId: getNextTaskId()
});

// ----------------------------------------------------------------------------------
// open tasks

export const createActionOpenFolder = (container, selectFile = null) => ({
  type: constants.AR_WORKER_OPEN_FOLDER,
  payload: {
    containerType: constants.CONTAINER_FOLDER,
    container, // null == autoSelect
    selectFile
  },
  taskId: getNextTaskId()
});

export const createActionOpenPlaylist = (container, selectFile = null) => ({
  type: constants.AR_WORKER_OPEN_PLAYLIST,
  payload: {
    containerType: constants.CONTAINER_PLAYLIST,
    container,
    selectFile
  },
  taskId: getNextTaskId()
});

export const createActionOpenDropped = files => ({
  type: constants.AR_WORKER_OPEN_DROPPED,
  payload: {
    containerType: constants.CONTAINER_CLIPBOARD,
    files
  },
  taskId: getNextTaskId()
});

export const createActionAutoSelect = (configChanged = false) => ({
  type: constants.AR_WORKER_AUTO_SELECT,
  payload: {
    containerType: constants.CONTAINER_AUTOSELECT,
    configChanged
  },
  taskId: getNextTaskId()
});

export const createActionDeliverMeta = file => ({
  type: constants.AR_WORKER_DELIVER_META,
  payload: { file },
  taskId: getNextTaskId()
});

// ----------------------------------------------------------------------------------
// crawler tasks

/*
  init crawler (check settings; triggers dir updates)
  incl. deliver first images (if dirs available, the delivery has to be postboned)
*/
export const createActionStart = (
  lastContainerType = null,
  container = null,
  selectFile = null
) => ({
  type: constants.AR_WORKER_START,
  payload: {
    lastContainerType,
    container,
    selectFile
  },
  taskId: getNextTaskId()
});

/*
  part of worker start/init
  list db-dir-items and triggers actions:
    createActionRemoveDirs
    createActionUpdateDir
*/
export const createActionPrepareDirsForUpdate = (configChanged = false) => ({
  type: constants.AR_WORKER_PREPARE_DIRS_FOR_UPDATE,
  payload: { configChanged },
  taskId: getNextTaskId()
});

/*
  remove non existing dirItems (DB)
  max n folders will be deleted at once => a new task is added containing the remaining elements
*/
export const createActionRemoveDirs = dirs => ({
  type: constants.AR_WORKER_REMOVE_DIRS,
  payload: { dirs },
  taskId: getNextTaskId()
});

/*
  scan the folder for sub folders (no files are considered)
  triggers new
    createActionSearchForNewDirs
    createActionUpdateDir
*/
export const createActionSearchForNewDirs = dir => ({
  type: constants.AR_WORKER_SEARCH_FOR_NEW_DIRS,
  payload: {
    dir
  },
  taskId: getNextTaskId()
});

/*
  load db-dir-item => sets fileItem.lastShown => calc new rating
*/
export const createActionRateDirByFile = file => ({
  type: constants.AR_WORKER_RATE_DIR_BY_FILE,
  payload: file,
  taskId: getNextTaskId()
});

/*
  update n files (loads meta) of a dir item
*/
export const createActionUpdateDirFiles = (folder, fileNames) => ({
  type: constants.AR_WORKER_UPDATE_DIRFILES,
  payload: {
    folder,
    fileNames // array of fileNames (without leading path)
  },
  taskId: getNextTaskId()
});

/*
 scan dir; remove non existing files and add new ones
 triggers createActionUpdateDirFiles
*/
export const createActionUpdateDir = (dir, configChanged = false) => ({
  type: constants.AR_WORKER_UPDATE_DIR,
  payload: {
    dir,
    configChanged
  },
  taskId: getNextTaskId()
});

export const createActionCrawlerFinally = () => ({
  type: constants.AR_WORKER_CRAWLER_FINALLY,
  payload: null,
  taskId: getNextTaskId()
});
