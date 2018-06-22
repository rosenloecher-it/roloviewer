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
        return goBack(state);
      case constants.ACTION_GO_NEXT:
        return goNext(state);
      case constants.ACTION_SHOW_FILES:
        return showFiles(state, action);
       case constants.ACTION_ADD_FILES:
         return addFiles(state, action);

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
    log.debug(`${_logKey}${func} (add) - ${action.items.length} items`);

    // add items
    return {
      ...state,
      items: state.items.concat(action.items)
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

function goBack(state) {
  let newIndex = -1;
  if (state.items.length > 0)
    newIndex = state.showIndex > 0 ? state.showIndex -1 : 0;

  return {
    ...state,
    showIndex: newIndex
  };
}

// ----------------------------------------------------------------------------------

function sendRequest() {
  const func = ".sendRequest";

  const p = new Promise((resolve, reject) => {
    const ops = require('../rendererOps');
    ops.requestNewFiles();
    resolve();
  }).then(() => {
    log.debug(`${_logKey}${func} - then`);
  }).catch((error) => {
    log.error(`${_logKey}${func} - catch -`, error);
  })
}

// ----------------------------------------------------------------------------------

function goNext(state) {
  const func = ".goNext";

  const length = state.items.length;

  if (length === 0)
    return state; // do nothing

  const newIndex = state.showIndex + 1;

  if ((state.container === null) && (newIndex + constants.DEFCONF_RENDERER_ITEM_RESERVE > length)) {
    log.debug(`${_logKey}${func} - request new item: newIndex=${newIndex}, items.length=${length}`);
    sendRequest();
  }

  if (newIndex >= length) {
    // do nothing
    return state;
  }

  return {
    ...state,
    showIndex: newIndex
  };
}

// ----------------------------------------------------------------------------------
