import log from 'electron-log';
import * as constants from '../constants';
import {PRIO_DELIVER_FILE_META, PRIO_OPEN} from "../../worker/taskManager";

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
      tagShow: [],
      tasksPrio1open: [],
      tasksPrio2meta: [],

  //     case constants.ACTION_OPEN_ITEM_FOLDER:
  //   return PRIO_OPEN;
  // case constants.AR_SLIDESHOW_DELIVER_FILE_META:
  //   return PRIO_DELIVER_FILE_META;
  // case constants.ACTION_CRAWLE_UPDATE_FILE:
  //   return 2;
  // case constants.ACTION_CRAWLE_EVAL_FOLDER:
  //   return 3;
  // case constants.ACTION_CRAWLE_UPDATE_FOLDER:
  //   return 4;
  // case constants.ACTION_CRAWLE_START_NEW:
  //   return 5;
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
        case constants.AR_CRAWLER_OPEN:
          return this.open(state, action);
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

  open(state, action) {

    const newState = {
      ...state,
      tasksPrio1open: [action],
    };

    if (action.payload.container !== null)  // folder or playlist
      newState.tasksPrio2meta = [];

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

}

