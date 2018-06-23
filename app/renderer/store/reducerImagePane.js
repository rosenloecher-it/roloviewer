import log from 'electron-log';
import * as constants from '../../common/constants';

// ----------------------------------------------------------------------------------

const _logKey = "reducerImapePane";
let _deliveryKey = 0;

// ----------------------------------------------------------------------------------

const defaultState = {
  autoPlay: false,
  autoFile: false,
  showIndex: -1,
  items: [],
  container: null
};

// ----------------------------------------------------------------------------------

export default (state = defaultState, action) => {

  try {
    switch (action.type) {
      case constants.ACTION_GO_BACK:
        return goTo(state, state.showIndex - 1);
        //return goBack(state, action);
      case constants.ACTION_GO_NEXT:
        return goTo(state, state.showIndex + 1);
        //return goNext(state, action);
      case constants.ACTION_GO_PAGE_BACK:
        return goPageBack(state, action);
      case constants.ACTION_GO_PAGE_NEXT:
        return goPageNext(state, action);
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
      case constants.ACTION_TOGGLE_AUTOPLAY:
        return toggleAutoPlay(state, action);


      default:
        return state;
    }
  } catch (err) {
    log.error(`${_logKey}.default - failed -`, action);
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

function showFiles(state, action) {
  const func = ".showFiles";

  setNewDeliveryKey(action.items);

  log.debug(`${_logKey}${func} - ${action.items.length} items`);

  return {
    ...state,
    items: action.items,
    showIndex: 0,
    container: action.container
  };
}

// ----------------------------------------------------------------------------------

function addFiles(state, action) {
  const func = ".addFiles";
  //log.debug(`${_logKey}${func}:`, state);

  setNewDeliveryKey(action.items);

  if (state.container === null) {

    const newItems = state.items.concat(action.items)
    let newIndex = state.showIndex;

    log.debug(`${_logKey}${func} (add) - ${action.items.length} items (sum = ${newItems.length})`);

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
    log.debug(`${_logKey}${func} (replace) - ${action.items.length} items`);

    // replace old items
    return {
      ...state,
      items: action.items,
      showIndex: 0,
      container: null
    };
  }

}

// ----------------------------------------------------------------------------------

function goTo(state, newIndexIn) {
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

function goPageBack(state, action) {
  const func = ".goPageBack";

  log.debug(`${_logKey}${func}`);

  return state;
}

// ----------------------------------------------------------------------------------

function goPageNext(state, action) {
  const func = ".goPageNext";

  log.debug(`${_logKey}${func}`);

  return state;
}

// ----------------------------------------------------------------------------------

function goEnd(state, action) {
  if (state.container === null)
    return goTo(state, state.showIndex + 1); // go next

  return goTo(state, state.items.length - 1); // go really to end
}

// ----------------------------------------------------------------------------------

function toggleAutoPlay(state, action) {
  const newAutoPlay = !state.autoPlay;
  return {
    ...state,
    autoPlay: newAutoPlay
  };
}

// ----------------------------------------------------------------------------------

