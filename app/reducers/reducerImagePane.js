
import * as actionType from '../actions/actionTypes';

const defaultState = {
  showIndex: 0
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
