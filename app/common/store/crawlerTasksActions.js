import deepmerge from 'deepmerge';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

let _currentTaskId = 1;

function getNextTaskId() {
  return _currentTaskId++;
}

// ----------------------------------------------------------------------------------

export const createActionOpen = (container = null, selectFile = null) => ({
  type: constants.AR_CRAWLERTASK_OPEN,
  payload: {
    container, // null == autoSelect
    selectFile,
  },
  taskId: getNextTaskId()
});

export const createActionRemoveTask = (obsoleteAction) => ({
  type: constants.AR_CRAWLER_REMOVE_TASK,
  payload: deepmerge.all([ obsoleteAction, {} ]),
  //payload: obsoleteAction
  taskId: getNextTaskId()
});


export const createActionDeliverMeta = (file) => ({
  type: constants.AR_CRAWLERTASK_DELIVER_META,
  payload: {file},
  taskId: getNextTaskId()
});
