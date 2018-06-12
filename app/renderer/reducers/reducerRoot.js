// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import reducerImagePane from './reducerImagePane';

const rootReducer = combineReducers({
  imagePane: reducerImagePane,
  router
});

export default rootReducer;
