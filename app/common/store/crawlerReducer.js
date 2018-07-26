import log from 'electron-log';
import * as constants from '../constants';
import deepEquals from 'deep-equal';
import deepmerge from 'deepmerge';

// ----------------------------------------------------------------------------------

const _logKey = "crawlerReducer";

export const PRIO_MAX = 7;

// ----------------------------------------------------------------------------------

export class CrawlerReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultTaskArray() {
    const tasks = [];

    for (let i = 0; i <= PRIO_MAX; i++)
      tasks.push([]);

    return tasks;
  }

  static defaultState() {
    return {
      batchCount: constants.DEFCONF_CRAWLER_BATCHCOUNT,
      databasePath: null,
      folderBlacklist: [],
      folderBlacklistSnippets: [],
      folderSource: [],
      maxFilesPerFolder: constants.DEFCONF_CRAWLER_MAX_FILES_PER_FOLDER,
      showRating: [],
      tagBlacklist: [],
      tagShow: [],
      updateDirsAfterMinutes: constants.DEFCONF_CRAWLER_UPDATE_DIRS_AFTER_MINUTES,
      weightingRating: constants.DEFCONF_CRAWLER_WEIGHTING_RATING,
      weightingRepeated: constants.DEFCONF_CRAWLER_WEIGHTING_REPEATED,
      weightingSeason: constants.DEFCONF_CRAWLER_WEIGHTING_SEASON,
      weightingSelPow: constants.DEFCONF_CRAWLER_WEIGHTING_SELPOW,
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

        case constants.AR_WORKER_INIT_REDUCER:
          return this.initReducer(state, action);

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
    const func = ".init";

    const {
      batchCount, databasePath,
      folderBlacklist, folderBlacklistSnippets, folderSource,
      maxFilesPerFolder, showRating, tagBlacklist, tagShow, updateDirsAfterMinutes,
      weightingRating, weightingRepeated, weightingSeason, weightingSelPow,
    } = action.payload;

    const newState = {
      ...state,
      batchCount, databasePath,
      folderBlacklist, folderBlacklistSnippets, folderSource,
      maxFilesPerFolder, showRating, tagBlacklist, tagShow, updateDirsAfterMinutes,
      weightingRating, weightingRepeated, weightingSeason, weightingSelPow,
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

  static cloneCrawleState(stateIn) {
    const state = deepmerge.all([ stateIn, {} ]);

    if (state.id !== undefined) delete state.id;
    if (state._id !== undefined) delete state._id;

    if (state.batchCount !== undefined) delete state.batchCount;
    if (state.databasePath !== undefined) delete state.databasePath;

    return state;
  }

  // .....................................................

  static compareCrawleStates(state1, state2) {
    // don't copmpare 1:1, but relevant settings

    if (state1 === state2)
      return true;
    if (!!state1 !== !!state2)
      return false;
    if (typeof(state1) !== typeof(state2))
      return false;

    const state1Cloned = CrawlerReducer.cloneCrawleState(state1);
    const state2Cloned = CrawlerReducer.cloneCrawleState(state2);

    return deepEquals(state1Cloned, state2Cloned);
  }

  // .....................................................
}

