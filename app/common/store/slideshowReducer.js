import log from 'electron-log';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

const _logKey = "slideshowReducer";

const DEFAULT_POSITION_DETAILS = constants.CORNER_POS_1;
const DEFAULT_POSITION_CRAWLERINFO = constants.CORNER_POS_4;
const DEFAULT_DETAILS_STATE = constants.DETAILS_STATE_MIN;

const _containerTypes = [
  { key: constants.CONTAINER_AUTOSELECT, name: "autoselect" },
  { key: constants.CONTAINER_FOLDER, name: "folder" },
  { key: constants.CONTAINER_PLAYLIST, name: "playlist" },
];

const _detailsStates = [
  constants.DETAILS_STATE_ALL,
  constants.DETAILS_STATE_MIN,
  constants.DETAILS_STATE_OFF,
];

// ----------------------------------------------------------------------------------

export class SlideshowReducer {

  constructor(name) {
    this._logKey = `${_logKey}(${name})`;
    this._deliveryKey = 0;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      aboutShow: false,
      autoPlay: false,
      crawlerInfoPosition: DEFAULT_POSITION_CRAWLERINFO,
      crawlerInfoShow: false,
      detailsPosition: DEFAULT_POSITION_DETAILS,
      detailsState: constants.DETAILS_STATE_MIN,
      lastContainer: null,
      lastContainerType: constants.CONTAINER_FOLDER,
      lastItem: null,
      random: false,
      timer: constants.DEFCONF_TIMER,
      transitionTimeAutoPlay: constants.DEFCONF_TRANSITION_TIME_AUTOPLAY,
      transitionTimeManual: constants.DEFCONF_TRANSITION_TIME_MANUAL,
    }
  }

  // .....................................................

  reduce(state = SlideshowReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {

        case constants.AR_SLIDESHOW_AUTOPLAY_START:
          return {...state, autoPlay: true};
        case constants.AR_SLIDESHOW_AUTOPLAY_STOP:
          return {...state, autoPlay: false};
        case constants.AR_SLIDESHOW_AUTOPLAY_TOGGLE:
          return {...state, autoPlay: !state.autoPlay};

        case constants.AR_SLIDESHOW_DETAILS_MOVE:
          return this.detailsMove(state, action);
        case constants.AR_SLIDESHOW_DETAILS_TOOGLE:
          return this.detailsToogle(state, action);

        case constants.AR_SLIDESHOW_CRAWLERINFO_MOVE:
          return this.crawlerInfoMove(state, action);
        case constants.AR_SLIDESHOW_CRAWLERINFO_TOOGLE:
          return { ...state, crawlerInfoShow: !state.crawlerInfoShow };

        case constants.AR_SLIDESHOW_INIT:
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
    //const func = ".init";
    //log.debug(`${this._logKey}${func} - in`);

    const {
      autoPlay,
      crawlerInfoPosition,
      crawlerInfoShow,
      detailsPosition,
      detailsState,
      lastContainer,
      lastContainerType,
      lastItem,
      random,
      timer,
      transitionTimeAutoPlay,
      transitionTimeManual,
    } = action.payload;

    const newState = {
      ...state,
      autoPlay,
      crawlerInfoPosition,
      crawlerInfoShow,
      detailsPosition,
      detailsState,
      lastContainer,
      lastContainerType,
      lastItem,
      random,
      timer,
      transitionTimeAutoPlay,
      transitionTimeManual,
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

  static getCornerPositions() {
    const detailsPositions = [
      constants.CORNER_POS_1,
      constants.CORNER_POS_2,
      constants.CORNER_POS_3,
      constants.CORNER_POS_4,
    ];

    return detailsPositions;
  }

  // .....................................................

  static getValidFreeCornerPosition(currentPosition, gotoNextPosition = false, skipPosition = null) {

    const detailsPositions = SlideshowReducer.getCornerPositions();

    let found = 0;
    for (let i = 0; i < detailsPositions.length; i++) {
      if (currentPosition === detailsPositions[i]) {
        found = i;
        break;
      }
    }

    if (gotoNextPosition) {
      found++;
      if (found >= detailsPositions.length)
        found = 0;
    }

    let foundPosition = detailsPositions[found];

    if (skipPosition) {
      if (foundPosition === skipPosition)
        foundPosition = this.getValidFreeCornerPosition(foundPosition, true, skipPosition);
    }

    return foundPosition;
  }

  // .....................................................

  static valiDetailsPosition(currentPosition) {

    return SlideshowReducer.getValidFreeCornerPosition(currentPosition || DEFAULT_POSITION_DETAILS, false, null);
  }

  // .....................................................

  static valiCrawlerInfoPosition(currentPosition, skipPosition) {

    return SlideshowReducer.getValidFreeCornerPosition(currentPosition || DEFAULT_POSITION_CRAWLERINFO, false, skipPosition);
  }

  // .....................................................

  detailsToogle(state) {
    const newDetailsState = SlideshowReducer.getValidDetailsState(state.detailsState, true);
    return {
      ...state,
      detailsState: newDetailsState
    };
  }

// --------------------------------------------------------------------------------

  detailsMove(state) {

    const newPosition = SlideshowReducer.getValidFreeCornerPosition(state.detailsPosition, true, state.crawlerInfoPosition);

    return {
      ...state,
      detailsPosition: newPosition
    };
  }

  // .....................................................

  crawlerInfoMove(state) {

    const newPosition = SlideshowReducer.getValidFreeCornerPosition(state.crawlerInfoPosition, true, state.detailsPosition);

    return {
      ...state,
      crawlerInfoPosition: newPosition,
    };
  }

  // .....................................................

  static getValidDetailsState(currentState, gotoNextState) {

    let found = 0;
    for (let i = 0; i < _detailsStates.length; i++) {
      if (currentState === _detailsStates[i]) {
        found = i;
        break;
      }
    }

    if (gotoNextState) {
      found++;
      if (found >= _detailsStates.length)
        found = 0;
    }

    return _detailsStates[found];
  }

  // .....................................................

  setLastItemContainer(state, action) {
    const { lastContainerType, lastContainer, lastItem } = action.payload;
    return {
      ...state,
      lastContainerType, lastContainer, lastItem
    };
  }

  // .....................................................

  static convert2ContainerTypeKey(name) {
    for (let i = 0; i < _containerTypes.length; i++) {
      const containerMode = _containerTypes[i];
      if (containerMode.name === name)
        return containerMode.key;
    }
    return null;
  }

  static convert2ContainerTypeName(key) {
    for (let i = 0; i < _containerTypes.length; i++) {
      const containerMode = _containerTypes[i];
      if (containerMode.key === key)
        return containerMode.name;
    }
    return null;
  }
}

// ----------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------
