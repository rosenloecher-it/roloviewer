import * as constants from '../../common/constants';

const defaultState = {
  autoPlay: false,
  autoFile: false,
  showIndex: -1,
  mediaList: []
};

export default (state = defaultState, action) => {

  switch (action.type) {
    case constants.ACTION_NEXT_OBJECT:
      return {
        ...state,
        showIndex: state.showIndex + 1
      };

    default:
      return state;
  }
};
