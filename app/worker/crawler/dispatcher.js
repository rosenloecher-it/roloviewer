import log from 'electron-log';
import * as constants from "../../common/constants";
import * as actionsCrawler from "../../common/store/crawlerActions";
import {CrawlerReducer} from "../../common/store/crawlerReducer";
import {CrawlerBase} from "./CrawlerBase";

// ----------------------------------------------------------------------------------

const _logKey = "dispatcher";

// ----------------------------------------------------------------------------------

export class Dispatcher extends CrawlerBase {

  constructor() {
    super();

    this.runningTask = null;

    this.processTask = this.processTask.bind(this);
  }

  // ........................................................

  processTask() {
    const func = ".processTask";

    const instance = this;
    const {storeManager} = instance.data;

    try {
      if (this.runningTask !== null)
        return; // async processing aktive

      const crawlerState = storeManager.crawlerState;
      instance.runningTask = CrawlerReducer.getNextTask(crawlerState);

      if (instance.runningTask === null)
        return; // ok

      //let countTasks2 = CrawlerReducer.countTasks(crawlerState);
      //log.debug(`${_logKey}${func} - countTasks2=${countTasks2}`);

      const p = new Promise((resolve) => {
        //log.debug(`${_logKey}${func}.promise - in`);

        const {metaReader} = instance.data;
        const {mediaCrawler} = instance.data;
        const {mediaLoader} = instance.data;
        const task = instance.runningTask;

        switch (task.type) { // eslint-disable-line default-case

          case constants.AR_CRAWLER_T2_DELIVER_META:
            metaReader.deliverMeta(task.payload.file);
            break;

          case constants.AR_CRAWLER_UPDATE_FILE:
            mediaCrawler.updateFile(task.payload);
            break;
          case constants.AR_CRAWLER_EVAL_FOLDER:
            mediaCrawler.evalFolder(task.payload);
            break;
          case constants.AR_CRAWLER_UPDATE_FOLDER:
            mediaCrawler.updateFolder(task.payload);
            break;
          case constants.AR_CRAWLER_START_NEW:
            mediaCrawler.startNew();
            break;

          case constants.AR_CRAWLER_T1_OPEN:
            mediaLoader.open(task.payload);
            break;

          default:
            throw new Error(`unknown task type ${task.type}!`);
        }

        resolve();

      }).catch((err) => {
        const logPos = `${_logKey}${func}.catch`;
        log.error(`${logPos} - exception -`, err);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `${logPos} - exception - ${err}`);

      }).then(() => { // finally

        const localRunningTask = instance.runningTask;
        instance.runningTask = null;
        const removeTaskAction = actionsCrawler.createActionRemoveTask(localRunningTask);
        storeManager.dispatchGlobal(removeTaskAction);

        setImmediate(instance.processTask); // check for next task

      }).catch((err) => { // catch finally
        const logPos = `${_logKey}${func}.finally.catch`;
        log.error(`${logPos} - exception -`, err);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `${logPos} - exception - ${err}`);
      });

    } catch (err) {
      log.error(`${_logKey}${func} - exception -`, err);
      storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func}.finally.catch - exception - ${err}`);
    }
  }

  // ........................................................
}

// ----------------------------------------------------------------------------------

