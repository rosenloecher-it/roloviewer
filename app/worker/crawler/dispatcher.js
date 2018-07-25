import log from 'electron-log';
import * as constants from "../../common/constants";
import * as workerActions from "../../common/store/workerActions";
import {WorkerReducer} from "../../common/store/workerReducer";
import {CrawlerBase} from "./crawlerBase";
import * as crawlerProgressActions from "../../common/store/statusActions";

// ----------------------------------------------------------------------------------

const _logKey = "dispatcher";

// ----------------------------------------------------------------------------------

export class Dispatcher extends CrawlerBase {

  constructor() {
    super();

    this.data = {
      runningTask: null,

      progressExistDataDb: false,
      progressExistDataRunning: false,

      lastCurrentTask: null,

      progressCurrentTask: null,
      progressCurrentDir: null,
      progressRemainingDirs: null,

      timerProgressRunning: null,
      timerProgressDb: null,
    };

    this.onTimerProgressDb = this.onTimerProgressDb.bind(this);
    this.onTimerProgressRunning = this.onTimerProgressRunning.bind(this);
    this.processTask = this.processTask.bind(this);
  }


  // ........................................................

  init() {
    const p = super.init().then(() => {

      this.initTimer();
      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;

  }

  // ........................................................

  initTimer() {
    const {data} = this;

    data.timerProgressRunning = setInterval(this.onTimerProgressRunning, 1000);
    data.timerProgressDb = setInterval(this.onTimerProgressDb, 5000);
  }

  // ........................................................

  shutdownTimer() {
    const {data} = this;

    if (data.timerProgressRunning)
      clearInterval(data.timerProgressRunning);
    if (data.timerProgressDb)
      clearInterval(data.timerProgressDb);
  }

  // ........................................................

  shutdown() {
    const func = '.shutdown';

    this.shutdownTimer();

    return super.shutdown();
  }

  // ........................................................

  processTask() {
    const func = ".processTask";

    const instance = this;
    const {storeManager} = instance.objects;
    const {data} = instance;
    let taskType = null;

    try {
      const workerState = storeManager.workerState;
      const nextTask = WorkerReducer.getNextTask(workerState);
      //log.debug(`${_logKey}${func} - in`, nextTask);

      this.setProgress(nextTask);

      if (nextTask === null)
        return; // ok

      if (data.runningTask !== null) {
        log.debug(`${_logKey}${func} - active runningTask => skip`);
        return; // async processing aktive
      }

      data.runningTask = nextTask;
      taskType = data.runningTask.type;

      //let countTasks2 = CrawlerReducer.countTasks(workerState);
      //log.debug(`${_logKey}${func} - countTasks2=${countTasks2}`);

      const p = instance.dispatchTask(data.runningTask).catch((err) => {

        this.logAndShowError(`${_logKey}${func}.promise.catch(${taskType})`, err);

        return Promise.resolve();

      }).then(() => { // finally
        //log.debug(`${_logKey}${func}.finally - in`);
        const localRunningTask = data.runningTask;
        data.runningTask = null;
        const removeTaskAction = workerActions.createActionRemoveTask(localRunningTask);
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
          if (task.payload.container)
            p = mediaLoader.open(task.payload);
          else
            p = mediaCrawler.addAutoSelectFiles();
          break;

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

  // .......................................................

  setProgress(task) {
    const func = '.setProgress';

    try {
      const taskTypeNone = 'none';
      const taskType = task ? task.type : taskTypeNone;
      const { data } = this;
      const workerState = this.objects.storeManager.workerState;

      if (taskType === taskTypeNone && taskType === data.lastCurrentTask)
        return; // do nothing

      const skipActionTypes = [
        constants.AR_WORKER_OPEN,
        constants.AR_WORKER_DELIVER_META,
        constants.AR_WORKER_RATE_DIR_BY_FILE,
      ];
      if (skipActionTypes.includes(taskType))
        return; // do nothing

      data.progressExistDataDb = true;
      data.progressExistDataRunning = true;

      const prio = WorkerReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);
      data.progressRemainingDirs = workerState.tasks[prio].length;

      let showFolder = null;
      let logInfo = null;

      switch (taskType) { // eslint-disable-line default-case

        case taskTypeNone:
          data.progressCurrentTask = 'Up-to-date';
          break;

        case constants.AR_WORKER_RELOAD_DIRS:
        case constants.AR_WORKER_INIT_CRAWLE:
          data.progressCurrentTask = 'Initialising';
          break;

        case constants.AR_WORKER_REMOVE_DIRS:
          data.progressCurrentTask = 'Removing folders';
          logInfo = task.payload;
          break;

        case constants.AR_WORKER_SCAN_FSDIR:
          data.progressCurrentTask = 'Scanning folders';
          logInfo = task.payload;
          break;

        case constants.AR_WORKER_UPDATE_FILES:
          data.progressCurrentTask = 'Updating folders';
          showFolder = task.payload.folder;
          logInfo = showFolder;
          break;

        case constants.AR_WORKER_UPDATE_DIR:
          data.progressCurrentTask = 'Updating folders';
          showFolder = task.payload;
          logInfo = showFolder;
          break;

        default:
          data.progressCurrentTask = 'Unknown task!!!';
          break;
      }

      if (showFolder)
        data.progressCurrentDir = showFolder;
      else
        data.progressCurrentDir = null;

      data.lastCurrentTask = data.progressCurrentTask;

      log.debug(`${_logKey}${func}(${taskType}) - ${data.progressCurrentTask}${logInfo ? `: ${logInfo}` : ''}`);
    } catch(err) {
      log.error(`${_logKey}${func} -`, err);
    }
  }

  // ........................................................

  onTimerProgressRunning() {

    const { data } = this;

    if (data.progressExistDataRunning) {
      const { progressRemainingDirs, progressCurrentTask, progressCurrentDir } = this.data;

      const action = crawlerProgressActions.createActionRunning(progressCurrentTask, progressCurrentDir, progressRemainingDirs);
      this.objects.storeManager.dispatchTask(action);

      data.progressExistDataRunning = false;
    }
  }

  // ........................................................

  onTimerProgressDb() {
    const func = '.onTimerProgressDb';

    const instance = this;
    const {data} = instance;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;

    if (!data.progressExistDataDb)
      return Promise.resolve();
    data.progressExistDataDb = false;

    let countDbDirs = null;

    const p = dbWrapper.countDirs().then((count) => {

      countDbDirs = count;
      return dbWrapper.countFiles();

    }).then((countDbFiles) => {

      const action = crawlerProgressActions.createActionDb(countDbDirs, countDbFiles);
      storeManager.dispatchTask(action);

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;

  }

  // ........................................................
}

// ----------------------------------------------------------------------------------

