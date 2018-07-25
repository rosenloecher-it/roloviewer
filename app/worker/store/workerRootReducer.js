import {combineReducers} from 'redux';
import * as constants from '../../common/constants';
import {ContextReducer} from "../../common/store/contextReducer";
import {CrawlerReducer} from "../../common/store/crawlerReducer";
import {SystemReducer} from "../../common/store/systemReducer";
import {WorkerReducer} from "../../common/store/workerReducer";

// --------------------------------------------------------------------------

const _myself = constants.IPC_WORKER;

const _contextReducer = new ContextReducer(_myself);
const _crawlerReducer = new CrawlerReducer(_myself);
const _systemReducer = new SystemReducer(_myself);
const _workerReducer = new WorkerReducer(_myself);

// --------------------------------------------------------------------------

const _workerRootReducer = combineReducers({
  context: _contextReducer.reduce,
  crawler: _crawlerReducer.reduce,
  system: _systemReducer.reduce,
  worker: _workerReducer.reduce,
});

// --------------------------------------------------------------------------

export default _workerRootReducer;

