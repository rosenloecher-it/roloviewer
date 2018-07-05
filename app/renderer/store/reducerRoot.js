// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import reducerSlideshow from './reducerSlideshow';

const rootReducer = combineReducers({
  slideshow: reducerSlideshow,
  router
});

export default rootReducer;
