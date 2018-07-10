import { combineReducers } from 'redux';
import * as constants from "../../common/constants";
import {ContextReducer} from '../../common/store/contextReducer';
import {CrawlerReducer} from '../../common/store/crawlerReducer';

//const _slideshowReducer = new SlideshowReducer(constants.IPC_MAIN);

const _contextReducer = new ContextReducer(constants.IPC_WORKER);
//const _crawlerReducer = new CrawlerReducer(constants.IPC_WORKER);

const _workerRootReducer = combineReducers({
  context: _contextReducer.reduce,
  //crawler: _crawlerReducer.reduce,
});

export default _workerRootReducer;
