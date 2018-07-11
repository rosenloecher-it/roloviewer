import log from 'electron-log';
import * as constants from "../../common/constants";
import * as actionsCrawler from "../../common/store/crawlerActions";
import {CrawlerReducer} from "../../common/store/crawlerReducer";

// ----------------------------------------------------------------------------------

const _logKey = "dispatcher";

// ----------------------------------------------------------------------------------

export class Dispatcher {

  constructor() {

    this.data = {
      mediaCrawler: null,
      mediaLoader: null,
      metaReader: null,
      storeManager: null
    };

    this.processTask = this.processTask.bind(this);
  }

  // ........................................................

  coupleObjects(input) {
    const func = ".coupleObjects";
    log.silly(`${_logKey}${func}`);

    this.data.mediaCrawler = input.mediaCrawler;
    this.data.mediaLoader = input.mediaLoader;
    this.data.metaReader = input.metaReader;
    this.data.storeManager = input.storeManager;

    if (!this.data.storeManager)
      throw new Error("!this.data.storeManager");
  }

  // ........................................................

  init() {
    const func = ".init";
    log.silly(`${_logKey}${func}`);

    // return dummy promise
    return new Promise(function(resolve) { resolve(); });
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function shutdownPromise(resolve, reject) {
      log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  processTask() {
    const func = ".processTask";

    const instance = this;
    const {storeManager} = instance.data;

    try {

      const crawlerState = storeManager.crawlerState;

      //log.debug(`${_logKey}${func} - crawlerState -`, crawlerState);

      const task = CrawlerReducer.getNextTask(crawlerState);
      let countTasks1 = CrawlerReducer.countTasks(crawlerState);

      //log.debug(`${_logKey}${func} - countTasks1=${countTasks1}`);

      if (task === null)
        return; // ok

      const removeTaskAction = actionsCrawler.createActionRemoveTask(task);
      storeManager.dispatchGlobal(removeTaskAction);

      //let countTasks2 = CrawlerReducer.countTasks(crawlerState);
      //log.debug(`${_logKey}${func} - countTasks2=${countTasks2}`);

      const p = new Promise(function(resolve, reject) {
        const funcInner = ".processTask";

        try {
          const {metaReader} = instance.data;
          const {mediaCrawler} = instance.data;
          const {mediaLoader} = instance.data;

          switch (task.type) { // eslint-disable-line default-case

            case constants.AR_CRAWLER_DELIVER_META:
              metaReader.deliverMeta(task.payload.file); break;

            case constants.ACTION_CRAWLE_UPDATE_FILE:
              mediaCrawler.updateFile(task.payload); break;
            case constants.ACTION_CRAWLE_EVAL_FOLDER:
              mediaCrawler.evalFolder(task.payload); break;
            case constants.ACTION_CRAWLE_UPDATE_FOLDER:
              mediaCrawler.updateFolder(task.payload); break;
            case constants.ACTION_CRAWLE_START_NEW:
              mediaCrawler.startNew(); break;

            case constants.AR_CRAWLER_OPEN:
              mediaLoader.open(task.payload); break;

            //ACTION_NEXT_TASK is not valid task!
            default:
              throw new Error("unknown task type!");
          }

          resolve();
        } catch (err) {
          log.error(`${_logKey}${func} - exception -`, err);
          storeManager.showMessage(constants.MSG_TYPE_INFO, `${_logKey}${funcInner} - exception - ${err}`);
          reject();
        }

        instance.processTask();
      });

    } catch (err) {
      log.error(`${_logKey}${func} - exception -`, err);
      storeManager.showMessage(constants.MSG_TYPE_INFO, `${_logKey}${func} - exception - ${err}`);
    }
  }

  // ........................................................

  static findNextTask(crawlerState) {

    let newTask = null;

    if (crawlerState.tasksPrio1open.length > 0) {
      newTask = crawlerState.tasksPrio1open[0];
    } else if (crawlerState.tasksPrio2meta.length > 0) {
      newTask = crawlerState.tasksPrio2meta[0];
    }

    return newTask;
  }

  // ........................................................

  static countTasks(crawlerState) {

    let count = 0;

    count += crawlerState.tasksPrio1open.length;
    count += crawlerState.tasksPrio2meta.length;

    return count;
  }

  // ........................................................
}

// ----------------------------------------------------------------------------------

