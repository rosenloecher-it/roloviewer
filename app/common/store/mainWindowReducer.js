import log from 'electron-log';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

const _logKey = "mainWindowReducer";

// ----------------------------------------------------------------------------------

export class MainWindowReducer {
  constructor(name) {
    this._logKey = `${_logKey}(${name})`;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      x: -1,
      y: -1,
      height: -1,
      width: -1,
      fullscreen: false,
      maximized: false,
      activeDevtool: false,
    }
  }

  // .....................................................

  reduce(state = MainWindowReducer.defaultState(), action) {
    const func = ".reduce"; // eslint-disable-line no-unused-vars
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`, action);

      switch (action.type) {
        case constants.AR_MAINWINDOW_INIT_REDUCER:
          return this.initReducer(state, action);
        case constants.AR_MAINWINDOW_SET_ACTIVE_DEVTOOL:
          return { ...state, activeDevtool: !!action.payload };
        case constants.AR_MAINWINDOW_SET_FULLSCREEN:
          return { ...state, fullscreen: !!action.payload };
        case constants.AR_MAINWINDOW_SET_MAXIMIZED:
          return { ...state, maximized: !!action.payload };

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

    //log.debug(`${this._logKey}${func} - action`, action);

    const {
      x, y, height, width,
      fullscreen, maximized,
      activeDevtool,
    } = action.payload;

    const newState = {
      ...state,
      x, y, height, width,
      fullscreen, maximized,
      activeDevtool,
    };

    //log.debug(`${this._logKey}${func} - out`, newState);

    return newState;
  }

  // .....................................................

}

