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

  shutdown() {



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
      //log.debug(`${_logKey}${func} - in`, instance.runningTask);

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

      const p = new Promise((resolve, reject) => {
        //log.debug(`${_logKey}${func}.promise - in`);

        const {metaReader} = instance.objects;
        const {mediaCrawler} = instance.objects;
        const {mediaLoader} = instance.objects;
        const task = instance.runningTask;

        let p = null;

        switch (task.type) { // eslint-disable-line default-case

          case constants.AR_WORKER_OPEN:
            p = mediaLoader.open(task.payload); break;
            // TODO switch to mediaCrawler: mediaCrawler.addAutoSelectFiles(task.payload.trailNumber)

          case constants.AR_WORKER_DELIVER_META:
            p = metaReader.deliverMeta(task.payload.file); break;

          case constants.AR_WORKER_STATUS_UPDATE:
            p = mediaCrawler.updateStatus(); break;

          case constants.AR_WORKER_DIRS_REMOVE_NON_EXISTING:
            p = mediaCrawler.removeNonExistingDirs(); break;

          case constants.AR_WORKER_DIR_REMOVE_NON_EXISTING:
            p = mediaCrawler.removeNonExistingDir(action.payload); break;

          case constants.AR_WORKER_DIR_RATE:
            p = mediaCrawler.rateDirFromPlayedFile(task.payload); break;

          case constants.AR_WORKER_FILES_META:
            p = mediaCrawler.updateFilesMeta(task.payload); break;

          case constants.AR_WORKER_DIR_UPDATE:
            p = mediaCrawler.updateDir(task.payload); break;
        }

        if (!p)
          reject(new Error(`unknown task type ${task.type}!`));
        else
          resolve(p);

      }).then((p2) => {
        return p2;
      }).catch((err) => {
        this.logAndShowError(`${_logKey}${func}.catch(${taskType})`, err);

      }).then(() => { // finally
        //log.debug(`${_logKey}${func}.finally - in`);
        const localRunningTask = instance.runningTask;
        instance.runningTask = null;
        const removeTaskAction = actionsCrawlerTasks.createActionRemoveTask(localRunningTask);
        storeManager.dispatchTask(removeTaskAction);

        setImmediate(instance.processTask); // check for next task

        return true;
      }).catch((err) => { // catch finally
        this.logAndShowError(`${_logKey}${func}.finally.catch(${taskType})`, err);
      });

    } catch (err) {
      this.logAndShowError(`${_logKey}${func}(${taskType})`, err);
    }
  }

  // ........................................................
}

// ----------------------------------------------------------------------------------

