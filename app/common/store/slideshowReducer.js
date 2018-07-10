import log from 'electron-log';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

const _logKey = "slideshowReducer";

// CSS classes
export const CORNER_POS_1 = "popover-left-bottom";
export const CORNER_POS_2 = "popover-left-top";
export const CORNER_POS_3 = "popover-right-top";
export const CORNER_POS_4 = "popover-right-bottom";

const DEFAULT_POSITION_DETAILS = CORNER_POS_1;
const DEFAULT_POSITION_CRAWLERINFO = CORNER_POS_4;

export const DETAILS_STATE_ALL = "ALL";
export const DETAILS_STATE_MIN = "MIN";
export const DETAILS_STATE_OFF = "OFF";

const _containerTypes = [
  { key: constants.CONTAINER_AUTOSELECT, name: "autoselect" },
  { key: constants.CONTAINER_FOLDER, name: "folder" },
  { key: constants.CONTAINER_PLAYLIST, name: "playlist" },
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
      autoPlay: false,
      container: null,
      containerType: 0,
      crawlerInfoPosition: DEFAULT_POSITION_CRAWLERINFO,
      crawlerInfoShow: false,
      cursorHide: false,
      detailsPosition: DEFAULT_POSITION_DETAILS,
      detailsState: DETAILS_STATE_MIN,
      helpShow: false,
      items: [],
      lastContainer: null,
      lastContainerType: constants.CONTAINER_FOLDER,
      lastItem: null,
      random: false,
      showIndex: -1,
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
        case constants.AR_SLIDESHOW_GO_BACK:
          return this.goTo(state, state.showIndex - 1);
        case constants.AR_SLIDESHOW_GO_NEXT:
          return this.goTo(state, state.showIndex + 1);
        case constants.AR_SLIDESHOW_GO_JUMP:
          return this.goJump(state, action);
        case constants.AR_SLIDESHOW_GO_PAGE:
          return this.goPage(state, action);
        case constants.AR_SLIDESHOW_GO_POS1:
          return this.goTo(state, 0);
        case constants.AR_SLIDESHOW_GO_END:
          return this.goTo(state, state.items.length - 1);

        case constants.AR_SLIDESHOW_SHOW_CONTAINER_FILES:
          return this.showFiles(state, action);
        case constants.AR_SLIDESHOW_ADD_AUTO_FILES:
          return this.addFiles(state, action);
        case constants.AR_SLIDESHOW_DELIVER_FILE_META:
          return this.deliverFileMeta(state, action);

        case constants.AR_SLIDESHOW_AUTOPLAY_START:
          return {...state, autoPlay: true};
        case constants.AR_SLIDESHOW_AUTOPLAY_STOP:
          return {...state, autoPlay: false};
        case constants.AR_SLIDESHOW_AUTOPLAY_TOGGLE:
          return {...state, autoPlay: !state.autoPlay};

        case constants.AR_SLIDESHOW_HELP_CLOSE:
          return { ...state, showHelp: false };
        case constants.AR_SLIDESHOW_HELP_TOOGLE:
          return { ...state, showHelp: !state.helpShow };

        case constants.ACTION_DETAILS_MOVE:
          return this.detailsMove(state, action);
        case constants.AR_SLIDESHOW_DETAILS_TOOGLE:
          return this.detailsToogle(state, action);

        case constants.AR_SLIDESHOW_CURSOR_HIDE:
          return {...state, cursorHide: true};
        case constants.AR_SLIDESHOW_CURSOR_SHOW:
          return {...state, cursorHide: false};

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
      detailsShow,
      lastContainer,
      lastContainerType,
      lastItem,
      random,
      screensaver,
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
      detailsShow,
      lastContainer,
      lastContainerType,
      lastItem,
      random,
      screensaver,
      timer,
      transitionTimeAutoPlay,
      transitionTimeManual,
      // reset
      cursorHide: false,
      helpShow: false,
      items: [],
      showIndex: -1,
    };

    //log.debug(`${this._logKey}${func} - out`, action);

    return newState;
  }

  // .....................................................

  setNewDeliveryKey(items) {
    this._deliveryKey++;

    for (let i = 0; i < items.length; i++)
      items[i].deliveryKey = this._deliveryKey; // eslint-disable-line no-param-reassign
  }

  // .....................................................

  showFiles(state, action) {
    const func = ".showFiles";

    const newItems = action.payload.items;
    const newSelectFile = action.payload.selectItem;

    if (!newItems) {
      log.error(`${_logKey}${func} !newItems`);
      throw new Error(`${_logKey}${func} - no items`, action);
    }

    //log.debug(`${_logKey}${func}:`, action);

    this.setNewDeliveryKey(newItems);

    log.debug(`${_logKey}${func} - ${newItems.length} items`);

    let newShowIndex = 0;
    if (action.selectFile) {
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].file === newSelectFile) {
          newShowIndex = i;
          break;
        }
      }
    }

    return {
      ...state,
      items: newItems,
      showIndex: newShowIndex,
      container: action.container,
      containerType: action.payload.containerType,
    };
  }

  // .....................................................

  addFiles(state, action) {
    const func = ".addFiles";

    this.setNewDeliveryKey(action.payload.items);

    if (state.containerType === constants.CONTAINER_AUTOSELECT) {

      const newItems = state.items.concat(action.payload.items);
      let newShowIndex = state.showIndex;

      log.debug(`${_logKey}${func} (add) - ${action.payload.items.length} items (sum = ${newItems.length})`);

      if (newShowIndex < 0 && newItems.length > 0)
        newShowIndex = 0;

      // add items
      return {
        ...state,
        items: newItems,
        showIndex: newShowIndex,
        container: null,
        containerType: action.payload.containerType
      }
    } else {
      //log.debug(`${_logKey}${func} (replace) - ${action.payload.items.length} items`);

      // replace old items
      return {
        ...state,
        items: action.payload.items,
        showIndex: 0,
        container: null,
        containerType: action.payload.containerType
      };
    }

  }

  // .....................................................

  goTo(state, newIndexIn) {
    const oldIndex = state.showIndex;
    let newIndex = newIndexIn;

    const length = state.items.length;

    if (length > 0) {
      if (newIndex >= length)
        newIndex = length -1;
      else if (newIndex < 0)
        newIndex = 0;
    } else
      newIndex = -1;

    if (oldIndex === newIndex)
      return state; // no change

    return {
      ...state,
      showIndex: newIndex
    };
  }

  // .....................................................

  goJump(state, action) {

    let jumpWidth = 0;
    if (action.payload)
      jumpWidth = action.payload;
    if (!jumpWidth)
      return state;

    return goTo(state, state.showIndex + jumpWidth);
  }

  // .....................................................

  goPage(state, action) {

    let pageDirection = 0;
    if (action.payload)
      pageDirection = action.payload;
    if (!pageDirection)
      return state;

    let newShowIndex = -1;

    do {
      if (state.container)
        break;

      let currentDeliveryKey = -1;
      if (state.showIndex >= 0 && state.showIndex < state.items.length) {
        const item = state.items[state.showIndex];
        if (item && item.deliveryKey)
          currentDeliveryKey = item.deliveryKey;
      }
      if (currentDeliveryKey < 0)
        break; // do standard

      // find first different deliveryKey
      if (pageDirection < 0) { // jump back
        for (let i = state.showIndex - 1; i > 0; i--) {
          const item = state.items[i];
          if (item.deliveryKey !== currentDeliveryKey) {
            newShowIndex = i;
            break; // ready
          }
        }
        if (newShowIndex < 0)
          newShowIndex = 0;
      } else {
        for (let i = state.showIndex + 1; i < state.items.length; i++) {
          const item = state.items[i];
          if (item.deliveryKey !== currentDeliveryKey) {
            newShowIndex = i;
            break; // ready
          }
        }
        if (newShowIndex < 0)
          newShowIndex = state.items.length - 1;
      }

      if (newShowIndex < 0)
        break;

      return goTo(state, newShowIndex);

    } while (false);

    return state;
  }

  // .....................................................

  static getCornerPositions() {
    const detailsPositions = [
      CORNER_POS_1,
      CORNER_POS_2,
      CORNER_POS_3,
      CORNER_POS_4,
    ];

    return detailsPositions;
  }

  // .....................................................

  static getValidFreeCornerPosition(currentPosition, gotoNextPosition = false, skipPosition = null) {

    const detailsPositions = this.getCornerPositions();

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

    return this.getValidFreeCornerPosition(currentPosition || DEFAULT_POSITION_DETAILS, false, null);
  }

  // .....................................................

  static valiCrawlerInfoPosition(currentPosition, skipPosition) {

    return this.getValidFreeCornerPosition(currentPosition || DEFAULT_POSITION_CRAWLERINFO, false, skipPosition);
  }

  // .....................................................

  detailsToogle(state) {
    const newDetailsShow = this.getValidDetailsState(state.detailsState, true);
    return {
      ...state,
      detailsState: newDetailsShow
    };
  }

// --------------------------------------------------------------------------------

  detailsMove(state) {
    return {
      ...state,
      detailsPosition: this.getValidFreeCornerPosition(state.detailsPosition, true)
    };
  }

  // .....................................................

  static getValidDetailsState(currentState, gotoNextState) {
    const detailsStates = [
      constants.DETAILS_STATE_ALL,
      constants.DETAILS_STATE_MIN,
      constants.DETAILS_STATE_OFF,
    ];

    let found = 0;
    for (let i = 0; i < detailsStates.length; i++) {
      if (currentState === detailsStates[i]) {
        found = i;
        break;
      }
    }

    if (gotoNextState) {
      found++;
      if (found >= detailsStates.length)
        found = 0;
    }

    return detailsStates[found];
  }

  // .....................................................

  deliverFileMeta(state, action) {

    let resultState = state;

    do {
      //log.debug(`${_logKey}.deliverFileMeta - ${action.type}`, action);

      if (!action.payload || !action.payload.meta) {
        log.debug(`${_logKey}.deliverFileMeta - ${action.type} ==> break`);
        break;
      }

      const {meta} = action.payload;
      const { file } = meta;
      const { items : itemsOrig } = state;

      let fountFirst = -1;
      for (let i = 0; i < itemsOrig.length; i++) {
        if (itemsOrig[i].file === file) {
          fountFirst = i;
          break;
        }
      }

      // real change
      if (fountFirst >= 0) {
        resultState = {...state};
        const { items : itemsNew } = resultState;

        for (let i = 0; i < itemsNew.length; i++) {
          if (itemsNew[i].file === file) {
            const newItem = itemsNew[i];
            newItem.meta = meta;

            // if container !== playlist --- break;
          }
        }
      }

    } while (false);

    return resultState;
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
