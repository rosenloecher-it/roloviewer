// @flow
import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import * as constants from '../../common/constants';
import {ContextReducer} from "../../common/store/contextReducer";
import {CrawlerReducer} from "../../common/store/crawlerReducer";
import {MessageReducer} from '../../common/store/messageReducer';
import {SlideshowReducer} from '../../common/store/slideshowReducer';
import {SystemReducer} from "../../common/store/systemReducer";
import {CrawlerTasksReducer} from "../../common/store/crawlerTasksReducer";

// --------------------------------------------------------------------------

const _myself = constants.IPC_RENDERER;

const _contextReducer = new ContextReducer(_myself);
const _crawlerReducer = new CrawlerReducer(_myself);
const _crawlerTasksReducer = new CrawlerTasksReducer(_myself);
const _messageReducer = new MessageReducer(_myself);
const _slideshowReducer = new SlideshowReducer(_myself);
const _systemReducer = new SystemReducer(_myself);

// --------------------------------------------------------------------------

const rootReducer = combineReducers({
  context: _contextReducer.reduce,
  crawler: _crawlerReducer.reduce,
  crawlerTasks: _crawlerTasksReducer.reduce,
  messages: _messageReducer.reduce,
  slideshow: _slideshowReducer.reduce,
  system: _systemReducer.reduce,
  router
});

// --------------------------------------------------------------------------

export default rootReducer;
