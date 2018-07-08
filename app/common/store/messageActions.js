import * as constants from "../constants";

export const createActionAddMessage = (msgType, msgText) => ({
  type: constants.ACTION_MSG_ADD,
  payload: { msgType, msgText }
});

export const createActionRemoveAll = () => ({
  type: constants.ACTION_MSG_REMOVE_ALL
});

export const createActionRemoveFirst = () => ({
  type: constants.ACTION_MSG_REMOVE_FIRST
});

export const createActionCloseDialog = () => ({
  type: constants.ACTION_MSG_CLOSE_DIALOG
});
