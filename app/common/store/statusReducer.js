import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "statusReducer";

// ----------------------------------------------------------------------------------

export class StatusReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      countDbDirsAll: null,
      countDbDirsShowable: null,
      countDbFilesAll: null,
      countDbFilesShowable: null,
      currentDir: null,
      currentItem: null,
      currentTask: null,
      remainingDirs: null,
    }
  }

  // .....................................................

  reduce(state = StatusReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_STATUS_RUNNING: {
          const {currentTask, currentDir, remainingDirs} = action.payload;
          return {
            ...state,
            currentTask, currentDir, remainingDirs
          };
        }

        case constants.AR_STATUS_DB: {
          const {countDbDirsShowable, countDbDirsAll, countDbFilesShowable, countDbFilesAll} = action.payload;
          return {
            ...state,
            countDbDirsShowable, countDbDirsAll, countDbFilesShowable, countDbFilesAll
          };
        }

        case constants.AR_STATUS_NOTIFY_CURRENT_ITEM: {
          return {
            ...state,
            currentItem: action.payload || null
          };
        }


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

}

