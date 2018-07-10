// @flow
import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import * as constants from '../../common/constants';
import {ContextReducer} from "../../common/store/contextReducer";
import {CrawlerReducer} from "../../common/store/crawlerReducer";
import {MainWindowReducer} from "../../common/store/mainWindowReducer";
import {MessageReducer} from '../../common/store/messageReducer';
import {SlideshowReducer} from '../../common/store/slideshowReducer';
import {SystemReducer} from "../../common/store/systemReducer";

// --------------------------------------------------------------------------

const _contextReducer = new ContextReducer(constants.IPC_RENDERER);
const _crawlerReducer = new CrawlerReducer(constants.IPC_RENDERER);
const _mainWindowReducer = new MainWindowReducer(constants.IPC_RENDERER);
const _messageReducer = new MessageReducer(constants.IPC_RENDERER);
const _slideshowReducer = new SlideshowReducer(constants.IPC_RENDERER);
const _systemReducer = new SystemReducer(constants.IPC_RENDERER);

// --------------------------------------------------------------------------

const rootReducer = combineReducers({
  context: _contextReducer.reduce,
  crawler: _crawlerReducer.reduce,
  mainWindow: _mainWindowReducer.reduce,
  messages: _messageReducer.reduce,
  slideshow: _slideshowReducer.reduce,
  system: _systemReducer.reduce,
  router
});

// --------------------------------------------------------------------------

export default rootReducer;
