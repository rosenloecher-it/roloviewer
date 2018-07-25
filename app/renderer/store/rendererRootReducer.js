// @flow
import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import * as constants from '../../common/constants';
import {ContextReducer} from "../../common/store/contextReducer";
import {CrawlerReducer} from "../../common/store/crawlerReducer";
import {MessageReducer} from '../../common/store/messageReducer';
import {RendererReducer} from "../../common/store/rendererReducer";
import {SlideshowReducer} from '../../common/store/slideshowReducer';
import {StatusReducer} from "../../common/store/statusReducer";
import {SystemReducer} from "../../common/store/systemReducer";
import {WorkerReducer} from "../../common/store/workerReducer";

// --------------------------------------------------------------------------

const _myself = constants.IPC_RENDERER;

const _contextReducer = new ContextReducer(_myself);
const _crawlerReducer = new CrawlerReducer(_myself);
const _messageReducer = new MessageReducer(_myself);
const _rendererReducer = new RendererReducer(_myself);
const _slideshowReducer = new SlideshowReducer(_myself);
const _statusReducer = new StatusReducer(_myself);
const _systemReducer = new SystemReducer(_myself);
const _workerReducer = new WorkerReducer(_myself);


// --------------------------------------------------------------------------

const rootReducer = combineReducers({
  context: _contextReducer.reduce,
  crawler: _crawlerReducer.reduce,
  messages: _messageReducer.reduce,
  renderer: _rendererReducer.reduce,
  slideshow: _slideshowReducer.reduce,
  status: _statusReducer.reduce,
  system: _systemReducer.reduce,
  worker: _workerReducer.reduce,
  router
});

// --------------------------------------------------------------------------

export default rootReducer;
