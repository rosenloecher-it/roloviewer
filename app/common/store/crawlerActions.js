import deepmerge from 'deepmerge';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

let _currentTaskId = 1;

function getTaskId() {
  return _currentTaskId++;
}

// ----------------------------------------------------------------------------------

export const createActionInit = ({
  batchCount, database,
  folderBlacklist, folderBlacklistSnippets, folderSource,
  showRating, tagBlacklist, tagShow,
  }) => ({
  type: constants.AR_CRAWLER_INIT,
  payload: {
    batchCount, database,
    folderBlacklist, folderBlacklistSnippets, folderSource,
    showRating, tagBlacklist, tagShow,
  }
});


export const createActionOpen = (container = null, selectFile = null) => ({
  type: constants.AR_CRAWLER_OPEN,
  payload: {
    container, // null == autoSelect
    selectFile,
    taskId: getTaskId()
  }
});

export const createActionRemoveTask = (obsoleteAction) => ({
  type: constants.AR_CRAWLER_REMOVE_TASK,
  payload: deepmerge.all([ obsoleteAction, {} ]),
  //payload: obsoleteAction
});


export const createActionDeliverMeta = (file) => ({
  type: constants.AR_CRAWLER_DELIVER_META,
  payload: {
    file,
    taskId: getTaskId()
  }
});
