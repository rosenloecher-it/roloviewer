import log from 'electron-log';
import * as constants from '../../common/constants';

// ----------------------------------------------------------------------------------

const _logKey = "reducerSlideshow";
let _deliveryKey = 0;

// ----------------------------------------------------------------------------------

const defaultState = {
  autoPlay: false,
  autoFile: false,
  showIndex: -1,
  items: [],
  container: null,
  helpShow: false,
  detailsState: getValidDetailsState(null, false),
  detailsPosition: getValidDetailsPosition(null, false),
  cursorHide: false,
};

// ----------------------------------------------------------------------------------

export default (state = defaultState, action) => {

  log.debug(`${_logKey}.default - action.type=${action.type}`);

  try {
    switch (action.type) {
      case constants.ACTION_GO_BACK:
        return goTo(state, state.showIndex - 1);
        //return goBack(state, action);
      case constants.ACTION_GO_NEXT:
        return goTo(state, state.showIndex + 1);
        //return goNext(state, action);
      case constants.ACTION_GO_JUMP:
        return goJump(state, action);
      case constants.ACTION_GO_PAGE:
        return goPage(state, action);
      case constants.ACTION_GO_POS1:
        return goTo(state, 0);
        //return goPos1(state, action);
      case constants.ACTION_GO_END:
        return goEnd(state, action);
        //return goEnd(state, action);
      case constants.ACTION_SHOW_FILES:
        return showFiles(state, action);
      case constants.ACTION_ADD_FILES:
        return addFiles(state, action);
      case constants.ACTION_DELIVER_FILE_META:
        return addMeta(state, action);

      case constants.ACTION_AUTOPLAY_START:
        return { ...state, autoPlay: true };
      case constants.ACTION_AUTOPLAY_STOP:
        return { ...state, autoPlay: false };
      case constants.ACTION_AUTOPLAY_TOGGLE:
        return { ...state, autoPlay: !state.autoPlay };

      case constants.ACTION_HELP_SHOW:
        return helpShow(state, action);
      case constants.ACTION_HELP_CLOSE:
        return helpClose(state, action);
      case constants.ACTION_HELP_TOOGLE:
        return helpToogle(state, action);

      case constants.ACTION_DETAILS_MOVE:
        return detailsMove(state, action);
      case constants.ACTION_DETAILS_TOOGLE:
        return detailsToogle(state, action);

      case constants.ACTION_CURSOR_HIDE:
        return cursorHide(state, action);
      case constants.ACTION_CURSOR_SHOW:
        return cursorShow(state, action);

      default:
        return state;
    }
  } catch (err) {
    log.error(`${_logKey}.default - exception -`, err);
    throw (err);
  }
};

// ----------------------------------------------------------------------------------

export function setNewDeliveryKey(items) {
  _deliveryKey++;

  for (let i = 0; i < items.length; i++)
    items[i].deliveryKey = _deliveryKey; // eslint-disable-line no-param-reassign
}

// ----------------------------------------------------------------------------------

export function showFiles(state, action) {
  const func = ".showFiles";

  setNewDeliveryKey(action.payload.items);

  log.debug(`${_logKey}${func} - ${action.payload.items.length} items`);

  return {
    ...state,
    items: action.items,
    showIndex: 0,
    container: action.container
  };
}

// ----------------------------------------------------------------------------------

export function addFiles(state, action) {
  const func = ".addFiles";

  //log.debug(`${_logKey}${func}:`, action);

  setNewDeliveryKey(action.payload.items);

  if (state.container === null) {

    const newItems = state.items.concat(action.payload.items);
    let newIndex = state.showIndex;

    log.debug(`${_logKey}${func} (add) - ${action.payload.items.length} items (sum = ${newItems.length})`);

    if (newIndex < 0 && newItems.length > 0)
      newIndex = 0;

    // add items
    return {
      ...state,
      items: newItems,
      showIndex: newIndex,
      container: null
    }
  } else {
    log.debug(`${_logKey}${func} (replace) - ${action.payload.items.length} items`);

    // replace old items
    return {
      ...state,
      items: action.payload.items,
      showIndex: 0,
      container: null
    };
  }

}

// ----------------------------------------------------------------------------------

export function goTo(state, newIndexIn) {
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

// ----------------------------------------------------------------------------------

export function goJump(state, action) {

  let jumpWidth = 0;
  if (action.payload)
    jumpWidth = action.payload;
  if (!jumpWidth)
    return state;

  return goTo(state, state.showIndex + jumpWidth);
}

// ----------------------------------------------------------------------------------

export function goPage(state, action) {

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

// ----------------------------------------------------------------------------------

export function goEnd(state) {
  if (state.container === null)
    return goTo(state, state.showIndex + 1); // go next

  return goTo(state, state.items.length - 1); // go really to end
}

// ----------------------------------------------------------------------------------

export function helpShow(state) {
  return {
    ...state,
    showHelp: true
  };
}

// ----------------------------------------------------------------------------------

export function helpClose(state) {
  return {
    ...state,
    helpShow: false
  };
}

// ----------------------------------------------------------------------------------

export function helpToogle(state) {
  const newShowHelp = !state.helpShow;
  return {
    ...state,
    helpShow: newShowHelp
  };
}

// ----------------------------------------------------------------------------------

export function getValidDetailsPosition(currentPosition, gotoNextPosition) {

  const detailsPositions = [
    "popover-left-bottom",
    "popover-left-top",
    "popover-right-top",
    "popover-right-bottom",
  ];

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

  return detailsPositions[found];
}

// ----------------------------------------------------------------------------------

export function detailsMove(state) {
  return {
    ...state,
    detailsPosition: getValidDetailsPosition(state.detailsPosition, true)
  };
}

// ----------------------------------------------------------------------------------

export function getValidDetailsState(currentState, gotoNextState) {
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

// ----------------------------------------------------------------------------------

export function detailsToogle(state) {
  const newDetailsState = getValidDetailsState(state.detailsState, true);
  return {
    ...state,
    detailsState: newDetailsState
  };
}

// ----------------------------------------------------------------------------------

export function cursorHide(state) {
  return {
    ...state,
    cursorHide: true,
  };
}

// ----------------------------------------------------------------------------------

export function cursorShow(state) {
  return {
    ...state,
    cursorHide: false,
  };
}

// ----------------------------------------------------------------------------------

export function addMeta(state, action) {

  let resultState = state;

  do {
    if (!action.payload)
      break;
    const { file } = action.payload;
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
          newItem.meta = action.payload;

          // if container !== playlist --- break;
        }
      }
    }

  } while (false);

  return resultState;
}

// ---------------------------------------------------------------------------------
