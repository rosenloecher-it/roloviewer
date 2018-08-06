import * as constants from "../constants";

export const createActionAddMessage = (msgType, msgText) => ({
  type: constants.AR_MESSAGE_ADD,
  payload: { msgType, msgText }
});

export const createActionRemoveAll = () => ({
  type: constants.AR_MESSAGE_REMOVE_ALL
});

export const createActionRemoveFirst = () => ({
  type: constants.AR_MESSAGE_REMOVE_FIRST
});

export const createActionCloseDialog = () => ({
  type: constants.AR_MESSAGE_CLOSE_DIALOG
});
