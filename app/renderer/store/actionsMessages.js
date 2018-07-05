import * as constants from '../../common/constants';

export const add = ({msgType, msgText, msgDetails}) => ({
  type: constants.ACTION_MSG_ADD,
  msgType, msgText, msgDetails
});

export const removeAll = () => ({
  type: constants.ACTION_MSG_REMOVE_ALL
});

export const removeFirst = () => ({
  type: constants.ACTION_MSG_REMOVE_FIRST
});

export const closeDialog = () => ({
  type: constants.ACTION_MSG_CLOSE_DIALOG
});


