import log from 'electron-log';
import * as constants from '../../common/constants';

// ----------------------------------------------------------------------------------

const logKey = "reducerImapePane";

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

  switch (action.type) {
    case constants.ACTION_GO_BACK:
      return goBack(state);
    case constants.ACTION_GO_NEXT:
      return goNext(state);
    case constants.ACTION_SHOW_FILES:
      return showFiles(state, action);

    default:
      return state;
  }
};

// ----------------------------------------------------------------------------------

function showFiles(state, action) {
  const length = action.items.length;
  const newIndex = 0;

  log.debug(`${logKey}.showFiles: ${length} => newIndex=${newIndex}` );

  return {
    ...state,
    items: action.items,
    showIndex: newIndex,
    container: action.container
  };
}

// ----------------------------------------------------------------------------------

function addFiles(state, action) {
  const length = state.items.length;
  let newIndex = -1;
  if (length > 0) {
    if (state.showIndex > 0)
      newIndex = state.showIndex - 1
  }
  return {
    ...state,
    showIndex: newIndex,
    container: null
  };
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

function goNext(state) {
  const length = state.items.length;
  let newIndex = -1;
  if (length > 0)
    newIndex = state.showIndex < length - 1 ? state.showIndex + 1 : length - 1;

  return {
    ...state,
    showIndex: newIndex
  };
}

// ----------------------------------------------------------------------------------
