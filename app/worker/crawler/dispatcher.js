import log from 'electron-log';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import {CrawlerTasksReducer} from "../../common/store/crawlerTasksReducer";
import {CrawlerBase} from "./crawlerBase";

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
    const {storeManager} = instance.objects;
    let taskType = null;

    try {
      const crawlerTasksState = storeManager.crawlerTasksState;
      const nextTask = CrawlerTasksReducer.getNextTask(crawlerTasksState);
      //log.debug(`${_logKey}${func} - in`, nextTask);

      if (nextTask === null)
        return; // ok


      if (this.runningTask !== null) {
        log.debug(`${_logKey}${func} - active runningTask => skip`);
        return; // async processing aktive
      }

      this.runningTask = nextTask;
      taskType = instance.runningTask.type;

      //let countTasks2 = CrawlerReducer.countTasks(crawlerTasksState);
      //log.debug(`${_logKey}${func} - countTasks2=${countTasks2}`);

      const p = instance.dispatchTask(instance.runningTask).catch((err) => {

        this.logAndShowError(`${_logKey}${func}.promise.catch(${taskType})`, err);

        return Promise.resolve();

      }).then(() => { // finally
        //log.debug(`${_logKey}${func}.finally - in`);
        const localRunningTask = instance.runningTask;
        instance.runningTask = null;
        const removeTaskAction = actionsCrawlerTasks.createActionRemoveTask(localRunningTask);
        storeManager.dispatchTask(removeTaskAction);

        setImmediate(instance.processTask); // check for next task

        return Promise.resolve();

      }).catch((err) => { // catch finally
        this.logAndShowError(`${_logKey}${func}.finally.catch(${taskType})`, err);
      });

    } catch (err) {
      this.logAndShowError(`${_logKey}${func}(${taskType})`, err);
    }
  }

  // ........................................................

  dispatchTask(task) {
    const func = ".dispatchTask";

    if (!task)
      return Promise.resolve();

    const taskType = task.type;
    const instance = this;

    const p = new Promise((resolve, reject) => {
      //log.debug(`${_logKey}${func}.promise - in`);

      const {metaReader} = instance.objects;
      const {mediaCrawler} = instance.objects;
      const {mediaLoader} = instance.objects;

      let p = null;

      switch (task.type) { // eslint-disable-line default-case

        case constants.AR_WORKER_OPEN:
          p = mediaLoader.open(task.payload);
          break;
          // TODO switch to mediaCrawler: mediaCrawler.addAutoSelectFiles(task.payload.trailNumber)

        case constants.AR_WORKER_DELIVER_META:
          p = metaReader.deliverMeta(task.payload.file);
          break;

        case constants.AR_WORKER_INIT_CRAWLE:
          p = mediaCrawler.initCrawler();
          break;

        case constants.AR_WORKER_REMOVE_DIRS:
          p = mediaCrawler.removeDirs(task.payload);
          break;

        case constants.AR_WORKER_SCAN_FSDIR:
          p = mediaCrawler.scanFsDir(task.payload);
          break;

        case constants.AR_WORKER_RATE_DIR_BY_FILE:
          p = mediaCrawler.rateDirByFile(task.payload);
          break;

        case constants.AR_WORKER_UPDATE_FILES:
          p = mediaCrawler.updateFiles(task.payload);
          break;

        case constants.AR_WORKER_UPDATE_DIR:
          p = mediaCrawler.updateDir(task.payload);
          break;

        case constants.AR_WORKER_RELOAD_DIRS:
          p = mediaCrawler.reloadDirs(task.payload);
          break;
      }


      if (!p)
        reject(new Error(`unknown task type ${task.type}!`));

      resolve(p);

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch(${taskType})`, err);
    });

    return p;
  }
}

// ----------------------------------------------------------------------------------

