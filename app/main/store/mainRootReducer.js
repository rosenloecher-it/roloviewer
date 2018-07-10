import {combineReducers} from 'redux';
import * as constants from '../../common/constants';
import {ContextReducer} from "../../common/store/contextReducer";
import {CrawlerReducer} from "../../common/store/crawlerReducer";
import {MainWindowReducer} from "../../common/store/mainWindowReducer";
import {SlideshowReducer} from '../../common/store/slideshowReducer';
import {SystemReducer} from "../../common/store/systemReducer";

// --------------------------------------------------------------------------

const _myself = constants.IPC_MAIN;
const _contextReducer = new ContextReducer(_myself);
const _crawlerReducer = new CrawlerReducer(_myself);
const _mainWindowReducer = new MainWindowReducer(_myself);
const _slideshowReducer = new SlideshowReducer(_myself);
const _systemReducer = new SystemReducer(_myself);

// --------------------------------------------------------------------------

const _mainRootReducer = combineReducers({
  context: _contextReducer.reduce,
  crawler: _crawlerReducer.reduce,
  mainWindow: _mainWindowReducer.reduce,
  slideshow: _slideshowReducer.reduce,
  system: _systemReducer.reduce,
});

// --------------------------------------------------------------------------

export default _mainRootReducer;
