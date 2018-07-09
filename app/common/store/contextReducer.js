import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "contextReducer";

// ----------------------------------------------------------------------------------

export class ContextReducer {
  constructor(name) {
    this.name = name;
    this.logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      isDevelopment: false,
      isDevTool: false,
      isProduction: true,
      isTest: false,
      configIsReadOnly: false,
      defaultConfigFile: null,
      configFile: null
    }
  }

  // .....................................................

  reduce(state = ContextReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this.logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_CONTEXT_INIT:
          return this.init(state, action);

        default:
          return state;
      }

    } catch (err) {
      log.error(`${this.logKey}${func}(${actionType}) - exception -`, err);
      log.debug(`${this.logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  init(state, action) {

    return action.payload
  }

  // .....................................................

}

