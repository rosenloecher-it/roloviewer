
import * as actionType from './actionTypes';

const defaultState = {
  autoPlay: false,
  autoFile: false,
  showIndex: -1,
  mediaList: []
};

export default (state = defaultState, action) => {

  switch (action.type) {
    case actionType.IMAGEPANE_NEXT_OBJECT:
      return {
        ...state,
        showIndex: state.showIndex + 1
      };

    default:
      return state;
  }
};
