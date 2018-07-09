import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import {MessageReducer} from '../../common/store/messageReducer';
import {SlideshowReducer} from '../../common/store/slideshowReducer';
import {ContextReducer} from '../../common/store/contextReducer';

//const _slideshowReducer = new SlideshowReducer(constants.IPC_MAIN);

const _contextReducer = new ContextReducer();

const _mainRootReducer = combineReducers({
  //slideshow: _slideshowReducer.reduce,
  context: _contextReducer.reduce
});

export default _mainRootReducer;
