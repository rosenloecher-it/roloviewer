import * as appConstants from '../../common/appConstants';

const defaultState = {
  autoPlay: false,
  autoFile: false,
  showIndex: -1,
  mediaList: []
};

export default (state = defaultState, action) => {

  switch (action.type) {
    case appConstants.ACTION_NEXT_OBJECT:
      return {
        ...state,
        showIndex: state.showIndex + 1
      };

    default:
      return state;
  }
};
