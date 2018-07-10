import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "messageReducer";

// ----------------------------------------------------------------------------------

export class MessageReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      messages: [],
      showMessages: false,
    }
  }

  // .....................................................

  reduce(state = MessageReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_MESSAGE_ADD:
          return this.add(state, action);
        case constants.AR_MESSAGE_REMOVE_ALL:
          return this.removeAll(state);
        case constants.AR_MESSAGE_REMOVE_FIRST:
          return this.removeFirst(state);
        case constants.AR_MESSAGE_CLOSE_DIALOG:
          return this.closeDialog(state);

        default:
          return state;
      }

    } catch (err) {
      log.error(`${this._logKey}${func}(${actionType}) - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  add(state, action) {

    //{msgType, msgText} : action.payload
    return {
      ...state,
      messages: [...state.messages, action.payload],
      showMessages: true,
    };
  }

  // .....................................................

  closeDialog(state) {
    return {
      ...state,
      showMessages: false
    };
  }

  // .....................................................

  removeFirst(state) {
    const newMessages = state.messages.slice(1);
    return {
      ...state,
      messages: newMessages,
      showMessages: (newMessages.length > 0)
    };
  }

  // .....................................................

  removeAll(state) {
    return {
      ...state,
      messages: [],
      showMessages: false
    };
  }

  // .....................................................
}

