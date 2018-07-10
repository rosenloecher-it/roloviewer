import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "systemReducer";

// ----------------------------------------------------------------------------------

export class SystemReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);

    //log.debug(`${this._logKey}.constructor - in`);
  }

  // .....................................................

  static defaultState() {
    return {
      exiftool: null,
      logfile: null,
      logLevelConsole: 'silly',
      logLevelFile: 'silly',
      powerSaveBlockTime: 0,
    }
  }

  // .....................................................

  reduce(state = SystemReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_SYSTEM_INIT:
          return this.init(state, action);

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

  init(state, action) {
    const func = ".init";
    log.debug(`${this._logKey}${func} - in`);

    const {
      exiftool,
      logfile, logLevelConsole, logLevelFile,
      powerSaveBlockTime
    } = action.payload;

    const newState = {
      ...state,
      exiftool,
      logfile, logLevelConsole, logLevelFile,
      powerSaveBlockTime
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

}

