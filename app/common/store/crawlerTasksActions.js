import deepmerge from 'deepmerge';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

let _currentTaskId = 1;

function getTaskId() {
  return _currentTaskId++;
}

// ----------------------------------------------------------------------------------

export const createActionOpen = (container = null, selectFile = null) => ({
  type: constants.AR_CRAWLER_T1_OPEN,
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
  type: constants.AR_CRAWLER_T2_DELIVER_META,
  payload: {
    file,
    taskId: getTaskId()
  }
});
