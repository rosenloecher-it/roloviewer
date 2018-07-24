import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "crawlerProgressReducer";

// ----------------------------------------------------------------------------------

export class CrawlerProgressReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      countDbDirs: null,
      countDbFiles: null,
      currentDir: null,
      currentTask: null,
      remainingDirs: null,
    }
  }

  // .....................................................

  reduce(state = CrawlerProgressReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_CRAWLERPROGRESS_RUNNING: {
          const {currentTask, currentDir, remainingDirs} = action.payload;
          return {
            ...state,
            currentTask, currentDir, remainingDirs
          };
        }

        case constants.AR_CRAWLERPROGRESS_DB: {
          const {countDbDirs, countDbFiles} = action.payload;
          return {
            ...state,
            countDbDirs, countDbFiles
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

