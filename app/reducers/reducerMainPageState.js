
import * as actionType from '../actions/actionTypes';

const defaultMainPageState = {
  showNaviPane: true,
  showThumbsPane: true,
  showDetailsPane: true,
  sizeNaviPane: -1,
  sizeThumbsPane: -1,
  sizeDetailsPane: -1
};

export default (state = defaultMainPageState, action) => {

  switch (action.type) {
    case actionType.MAINPAGE_TOGGLE_NAVIPANE:
      return {
        ...state,
        showNaviPane: !state.showNaviPane
      };
    case actionType.MAINPAGE_TOGGLE_DETAILSPANE:
      return {
        ...state,
        showDetailsPane: !state.showDetailsPane
      };
    case actionType.MAINPAGE_TOGGLE_THUMBSPANE:
      return {
        ...state,
        showThumbsPane: !state.showThumbsPane
      };

    case actionType.MAINPAGE_RESIZE_NAVIPANE:
      return {
        ...state,
        sizeNaviPane: action.newSize
      };
    case actionType.MAINPAGE_RESIZE_DETAILSPANE:
      return {
        ...state,
        sizeDetailsPane: action.newSize
      };
    case actionType.MAINPAGE_RESIZE_THUMBSPANE:
      return {
        ...state,
        sizeThumbsPane: action.newSize
      };

    default:
      return state;
  }
};
