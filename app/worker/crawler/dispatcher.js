import log from 'electron-log';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import {CrawlerTasksReducer} from "../../common/store/crawlerTasksReducer";
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
      if (this.runningTask !== null) {
        log.debug(`${_logKey}${func} - active runningTask => skip`);
        return; // async processing aktive
      }

      const crawlerTasksState = storeManager.crawlerTasksState;
      instance.runningTask = CrawlerTasksReducer.getNextTask(crawlerTasksState);
      //log.debug(`${_logKey}${func} - in`, instance.runningTask);

      if (instance.runningTask === null)
        return; // ok

      //let countTasks2 = CrawlerReducer.countTasks(crawlerTasksState);
      //log.debug(`${_logKey}${func} - countTasks2=${countTasks2}`);

      const p = new Promise((resolve, reject) => {
        //log.debug(`${_logKey}${func}.promise - in`);

        const {metaReader} = instance.data;
        const {mediaCrawler} = instance.data;
        const {mediaLoader} = instance.data;
        const task = instance.runningTask;

        let p = null;

        switch (task.type) { // eslint-disable-line default-case

          case constants.AR_CRAWLER_T2_DELIVER_META:
            p = metaReader.deliverMeta(task.payload.file); break;

          case constants.AR_CRAWLER_UPDATE_FILE:
            p = mediaCrawler.updateFile(task.payload); break;
          case constants.AR_CRAWLER_EVAL_FOLDER:
            p = mediaCrawler.evalFolder(task.payload); break;
          case constants.AR_CRAWLER_UPDATE_FOLDER:
            p = mediaCrawler.updateFolder(task.payload); break;
          case constants.AR_CRAWLER_START_NEW:
            p = mediaCrawler.startNew(); break;

          case constants.AR_CRAWLER_T1_OPEN:
            p = mediaLoader.open(task.payload); break;
        }

        if (!p)
          reject(new Error(`unknown task type ${task.type}!`));
        else
          resolve(p);

      }).then((p2) => {
        return p2;
      }).catch((err) => {
        const logPos = `${_logKey}${func}.catch`;
        log.error(`${logPos} - exception -`, err);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `${logPos} - exception - ${err}`);

      }).then(() => { // finally
        //log.debug(`${_logKey}${func}.finally - in`);
        const localRunningTask = instance.runningTask;
        instance.runningTask = null;
        const removeTaskAction = actionsCrawlerTasks.createActionRemoveTask(localRunningTask);
        storeManager.dispatchGlobal(removeTaskAction);

        setImmediate(instance.processTask); // check for next task

        return true;
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

