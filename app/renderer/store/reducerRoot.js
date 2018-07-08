// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import {MessageReducer} from '../../common/store/messageReducer';
import {SlideshowReducer} from '../../common/store/slideshowReducer';
import * as constants from '../../common/constants';

const _messageReducer = new MessageReducer(constants.IPC_RENDERER);
const _slideshowReducer = new SlideshowReducer(constants.IPC_RENDERER);

const rootReducer = combineReducers({
  slideshow: _slideshowReducer.reduce,
  messages: _messageReducer.reduce,
  router
});

export default rootReducer;
