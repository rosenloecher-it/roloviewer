// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import reducerMainPageState from './reducerMainPageState';
import reducerImagePane from './reducerImagePane';

const rootReducer = combineReducers({
  mainPageState: reducerMainPageState,
  imagePane: reducerImagePane,
  router
});

export default rootReducer;
