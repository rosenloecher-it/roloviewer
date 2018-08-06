import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "systemReducer";

// ----------------------------------------------------------------------------------

export class SystemReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      exiftool: null,
      lastDialogFolder: null,
      logfile: null,
      logLevel: 'silly',
      powerSaveBlockMinutes: constants.DEFCONF_POWER_SAVE_BLOCK_TIME,
    }
  }

  // .....................................................

  reduce(state = SystemReducer.defaultState(), action) {
    const func = ".reduce"; // eslint-disable-line no-unused-vars
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_SYSTEM_INIT_REDUCER:
          return this.initReducer(state, action);
        case constants.AR_SYSTEM_SET_LAST_DIALOG_FOLDER:
          return {...state, lastDialogFolder: action.payload};

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

  initReducer(state, action) {
    const func = ".init"; // eslint-disable-line no-unused-vars
    //log.debug(`${this._logKey}${func} - in`);

    const {
      exiftool, lastDialogFolder,
      logfile, logLevel,
      mapUrlFormat, powerSaveBlockMinutes
    } = action.payload;

    const newState = {
      ...state,
      exiftool, lastDialogFolder,
      logfile, logLevel,
      mapUrlFormat, powerSaveBlockMinutes
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

}

