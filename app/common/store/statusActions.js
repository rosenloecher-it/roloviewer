import * as constants from "../constants";


export const createActionRunning = (currentTask, currentDir, remainingDirs) => ({
  type: constants.AR_STATUS_RUNNING,
  payload: { currentTask, currentDir, remainingDirs },
});

export const createActionDb = (countDbDirs, countDbFiles) => ({
  type: constants.AR_STATUS_DB,
  payload: { countDbDirs, countDbFiles },
});

export const createActionNotifyCurrentItem = (currentItem) => ({
  type: constants.AR_STATUS_NOTIFY_CURRENT_ITEM,
  payload: currentItem,
});