import log from 'electron-log';
import * as constants from '../../common/constants';

// ----------------------------------------------------------------------------------

const _logKey = "reducerMessages";

// ----------------------------------------------------------------------------------

const defaultState = {
  messages: [],
  showMessages: false,
};

// ----------------------------------------------------------------------------------

export default (state = defaultState, action) => {
  const func = ".default";
  let actionType = '???';

  try {
    actionType = action.type;
    log.debug(`${_logKey}${func}(${actionType}) - in`);

    switch (action.type) {
      case constants.ACTION_MSG_ADD:
        return add(state, action);
      case constants.ACTION_MSG_REMOVE_ALL:
        return removeAll(state);
      case constants.ACTION_MSG_REMOVE_FIRST:
        return removeFirst(state);
      case constants.ACTION_MSG_CLOSE_DIALOG:
        return closeDialog(state);

      default:
        log.debug(`${_logKey}${func}(${actionType}) - skip`);
        return state;
    }
  } catch (err) {
    log.error(`${_logKey}${func}(${actionType}) - exception -`, err);
    log.debug(`${_logKey}${func} - action -`, action);
    throw (err);

    //TODO show message
  }
};

// ----------------------------------------------------------------------------------

export function add(state, action) {

  //{msgType, msgText} : action.payload
  return {
    ...state,
    messages: [...state.messages, action.payload],
    showMessages: true,
  };
}

// ----------------------------------------------------------------------------------

export function removeFirst(state) {
  const newMessages = state.messages.slice(1);
  return {
    ...state,
    messages: newMessages,
    showMessages: (newMessages.length > 0)
  };
}

// ----------------------------------------------------------------------------------

export function removeAll(state) {
  return {
    ...state,
    messages: [],
    showMessages: false
  };
}

// ----------------------------------------------------------------------------------

export function closeDialog(state) {
  return {
    ...state,
    showMessages: false
  };
}

// ----------------------------------------------------------------------------------
