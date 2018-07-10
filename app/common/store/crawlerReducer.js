import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "crawlerReducer";

// ----------------------------------------------------------------------------------

export class CrawlerReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);

    //log.debug(`${this._logKey}.constructor - in`);
  }

  // .....................................................

  static defaultState() {
    return {
      batchCount: constants.DEFCONF_CRAWLER_BATCHCOUNT,
      database: null,
      folderBlacklist: [],
      folderBlacklistSnippets: [],
      folderSource: [],
      showRating: [],
      tagBlacklist: [],
      tagShow: []
    }
  }

  // .....................................................

  reduce(state = CrawlerReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_CRAWLER_INIT:
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
      batchCount, database,
      folderBlacklist, folderBlacklistSnippets, folderSource,
      showRating, tagBlacklist, tagShow,
    } = action.payload;

    const newState = {
      ...state,
      batchCount, database,
      folderBlacklist, folderBlacklistSnippets, folderSource,
      showRating, tagBlacklist, tagShow,
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

}

