// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import reducerSlideshow from './reducerSlideshow';
import reducerMessages from './reducerMessages';

const rootReducer = combineReducers({
  slideshow: reducerSlideshow,
  messages: reducerMessages,
  router
});

export default rootReducer;
