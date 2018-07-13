import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "contextReducer";

// ----------------------------------------------------------------------------------

export class ContextReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      isDevelopment: false,
      isDevtool: false,
      isProduction: true,
      isTest: false,
      configIsReadOnly: false,
      configFile: null,
      tempCliAutoplay: false,
      tempCliAutoselect: false,
      tempCliFullscreen: false,
      tempCliOpenContainer: null,
      tempCliScreensaver: false,
      versionElectron: null,
      versionExifReader: null,
    }
  }

  // .....................................................

  reduce(state = ContextReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_CONTEXT_INIT:
          return this.init(state, action);

        case constants.AR_CONTEXT_SET_VERSION_EXIFREADER:
          return {...state, versionExifReader: action.payload};

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
    //log.debug(`${this._logKey}${func} - in`);

    const {
      isDevelopment, isDevtool, isProduction, isTest, isScreensaver,
      configFile, configIsReadOnly,
      tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer,
      versionElectron
    } = action.payload;

    const newState = {
      ...state,
      isDevelopment, isDevtool, isProduction, isTest, isScreensaver,
      configFile, configIsReadOnly,
      tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer,
      versionElectron
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

}

