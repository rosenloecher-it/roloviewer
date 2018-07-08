import * as constants from "../constants";

export const createActionAddMessage = (msgType, msgText) => ({
  type: constants.ACTION_MSG_ADD,
  payload: { msgType, msgText }
});
