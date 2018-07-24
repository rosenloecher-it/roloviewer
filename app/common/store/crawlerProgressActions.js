import * as constants from "../constants";


export const createActionRunning = (currentTask, currentDir, remainingDirs) => ({
  type: constants.AR_CRAWLERPROGRESS_RUNNING,
  payload: { currentTask, currentDir, remainingDirs },
});

export const createActionDb = (countDbDirs, countDbFiles) => ({
  type: constants.AR_CRAWLERPROGRESS_DB,
  payload: { countDbDirs, countDbFiles },
});
