import fs from "fs";
import log from 'electron-log';
import * as constants from "../../common/constants";
import * as statusActions from "../../common/store/statusActions";
import * as workerActions from "../../common/store/workerActions";
import {CrawlerBase} from "./crawlerBase";
import {WorkerReducer} from "../../common/store/workerReducer";

// ----------------------------------------------------------------------------------

const _logKey = "dispatcher";

// ----------------------------------------------------------------------------------

export class Dispatcher extends CrawlerBase {

  constructor() {
    super();

    this.data = {
      runningTask: null,

      processingStopped: false,

      lastStatusTaskType: null,
      lastSkippedTaskId: null,

      statusExistDataDb: false,
      statusExistDataCrawler: false,
      statusCrawlerTask: null,
      statusCrawlerDir: null,

      timerProcessForgotten: null,
      timerStatusCrawler: null,
      timerStatusDb: null,
    };

    this.onTimerProcessForgotten = this.onTimerProcessForgotten.bind(this);
    this.onTimerStatusDb = this.onTimerStatusDb.bind(this);
    this.onTimerStatusCrawler = this.onTimerStatusCrawler.bind(this);
    this.processTask = this.processTask.bind(this);
  }


  // ........................................................

  init() {
    const func = 'init';

    const instance = this;

    const p = super.init().then(() => {

      this.initTimer();
      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  initTimer() {
    const {data} = this;

    data.timerStatusCrawler = setInterval(this.onTimerProcessForgotten, 300);
    data.timerStatusCrawler = setInterval(this.onTimerStatusCrawler, 1000);
    data.timerStatusDb = setInterval(this.onTimerStatusDb, 5000);
  }

  // ........................................................

  shutdownTimer() {
    const {data} = this;

    if (data.onTimerProcessForgotten)
      clearInterval(data.onTimerProcessForgotten);
    if (data.timerStatusCrawler)
      clearInterval(data.timerStatusCrawler);
    if (data.timerStatusDb)
      clearInterval(data.timerStatusDb);
  }

  // ........................................................

  shutdown() {

    this.shutdownTimer();

    return super.shutdown();
  }

  // ........................................................

   stopProcessingObject(object) {
    if (object)
      object.stopProcessing();
  }

  // ........................................................

  stopProcessing() {

    this.data.processingStopped = true;

    this.stopProcessingObject(this.objects.dbWrapper);
    this.stopProcessingObject(this.objects.mediaCrawler);
    this.stopProcessingObject(this.objects.mediaComposer);
    this.stopProcessingObject(this.objects.mediaLoader);
    this.stopProcessingObject(this.objects.metaReader);
    this.stopProcessingObject(this.objects.storeManager);

    log.debug(`${_logKey}.stopProcessing`);
  }

  // ........................................................

  processTask() {
    const func = ".processTask";

    const instance = this;
    const {storeManager} = instance.objects;
    const {data} = instance;
    let taskType = null;

    try {
      if (data.processingStopped) {
        log.debug(`${_logKey}${func} - processing stopped => skipped`);
        return;
      }

      const workerState = storeManager.workerState;
      const nextTask = WorkerReducer.getNextTask(workerState);
      //log.debug(`${_logKey}${func} - in`, nextTask);

      this.setStatus(nextTask);

      if (nextTask === null)
        return; // ok

      if (data.runningTask !== null) {
        const {taskId} = data.runningTask;
        if (taskId === data.lastSkippedTaskId) {
          log.debug(`${_logKey}${func} - active runningTask => skip (taskId=${taskId}, type=${data.runningTask.type})`);
        }
        data.lastSkippedTaskId = taskId;
        return; // async processing aktive
      }

      data.runningTask = nextTask;
      taskType = data.runningTask.type;

      //let countTasks2 = CrawlerReducer.countTasks(workerState);
      //log.debug(`${_logKey}${func} - countTasks2=${countTasks2}`);

      const p = instance.dispatchTask(data.runningTask).catch((err) => {

        instance.logAndShowError(`${_logKey}${func}.promise.catch(${taskType})`, err);

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
        instance.logAndShowError(`${_logKey}${func}.finally.catch(${taskType})`, err);
      });

    } catch (err) {
      instance.logAndShowError(`${_logKey}${func}(${taskType})`, err);
    }
  }

  // ........................................................

  dispatchTask(task) {
    const func = ".dispatchTask";

    if (!task)
      return Promise.resolve();

    const taskType = task.type;
    const instance = this;

    const pOuter = new Promise((resolve, reject) => {
      //log.debug(`${_logKey}${func}.promise - in`);

      const {metaReader} = instance.objects;
      const {mediaCrawler} = instance.objects;
      const {mediaLoader} = instance.objects;

      let p = null;

      switch (task.type) { // eslint-disable-line default-case

        case constants.AR_WORKER_AUTO_SELECT:
          p = mediaCrawler.autoSelectFiles(task.payload);
          break;

        case constants.AR_WORKER_OPEN_DROPPED:
          p = mediaLoader.openDropped(task.payload);
          break;

        case constants.AR_WORKER_OPEN_FOLDER:
          p = mediaLoader.openFolder(task.payload);
          break;

        case constants.AR_WORKER_OPEN_PLAYLIST:
          p = mediaLoader.openPlaylist(task.payload);
          break;

        case constants.AR_WORKER_DELIVER_META:
          p = metaReader.deliverMeta(task.payload.file);
          break;

        case constants.AR_WORKER_START:
          p = this.initWorker(task.payload);
          break;

        case constants.AR_WORKER_REMOVE_DIRS:
          p = mediaCrawler.removeDirs(task.payload);
          break;

        case constants.AR_WORKER_SEARCH_FOR_NEW_DIRS:
          p = mediaCrawler.searchForNewDirs(task.payload);
          break;

        case constants.AR_WORKER_RATE_DIR_BY_FILE:
          p = mediaCrawler.rateDirByFile(task.payload);
          break;

        case constants.AR_WORKER_UPDATE_DIRFILES:
          p = mediaCrawler.updateDirFiles(task.payload);
          break;

        case constants.AR_WORKER_UPDATE_DIR:
          p = mediaCrawler.updateDir(task.payload);
          break;

        case constants.AR_WORKER_PREPARE_DIRS_FOR_UPDATE:
          p = mediaCrawler.prepareDirsForUpdate(task.payload);
          break;
      }

      if (!p)
        reject(new Error(`unknown task type ${task.type}!`));
      else
        resolve(p);

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch(${taskType})`, err);
    });

    return pOuter;
  }

  // .......................................................

  initWorker(payload) {
    const func = '.initWorker';

    const instance = this;
    const {mediaCrawler} = instance.objects;
    const {mediaLoader} = instance.objects;

    const {lastContainerType} = payload;
    const {container} = payload;
    // const {selectFile} = payload;

    let existContainer = false;
    if (container)
      existContainer = fs.existsSync(container);

    let p = null;

    if (constants.CONTAINER_FOLDER === lastContainerType && existContainer) {
      p = mediaLoader.openFolder(payload);
    } else if (constants.CONTAINER_PLAYLIST === lastContainerType && existContainer) {
      p = mediaLoader.openPlaylist(payload);
    }

    if (!p)
      p = Promise.resolve();

    p = p.then(() => {

      const activeAutoSelect = (lastContainerType === constants.CONTAINER_AUTOSELECT);
      return mediaCrawler.start(activeAutoSelect);

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch(containerType=${lastContainerType})`, err);
    });

    return p;
  }

  // .......................................................

  setStatus(task) {
    const func = '.setStatus';

    try {
      const taskTypeNone = 'none';
      const taskType = task ? task.type : taskTypeNone;
      const { data } = this;

      if (taskType === taskTypeNone && taskType === data.lastStatusTaskType)
        return; // do nothing

      const skipActionTypes = [
        constants.AR_WORKER_OPEN_FOLDER,
        constants.AR_WORKER_DELIVER_META,
        constants.AR_WORKER_RATE_DIR_BY_FILE,
      ];
      if (skipActionTypes.includes(taskType))
        return; // do nothing

      data.statusExistDataDb = true;
      data.statusExistDataCrawler = true;

      let showFolder = null;
      let logInfo = null;

      switch (taskType) { // eslint-disable-line default-case

        case taskTypeNone:
          data.statusCrawlerTask = 'Up-to-date';
          break;

        case constants.AR_WORKER_PREPARE_DIRS_FOR_UPDATE:
        case constants.AR_WORKER_START:
          data.statusCrawlerTask = 'Initialising';
          break;

        case constants.AR_WORKER_REMOVE_DIRS:
          data.statusCrawlerTask = 'Removing folders';
          //logInfo = task.payload; // list of all folders
          break;

        case constants.AR_WORKER_SEARCH_FOR_NEW_DIRS:
          data.statusCrawlerTask = 'Scanning folders';
          logInfo = task.payload;
          break;

        case constants.AR_WORKER_UPDATE_DIRFILES:
          data.statusCrawlerTask = 'Updating folders';
          showFolder = task.payload.folder;
          logInfo = showFolder;
          break;

        case constants.AR_WORKER_UPDATE_DIR:
          data.statusCrawlerTask = 'Updating folders';
          showFolder = task.payload;
          logInfo = showFolder;
          break;

        default:
          data.statusCrawlerTask = 'Unknown task!!!';
          break;
      }

      if (showFolder)
        data.statusCrawlerDir = showFolder;
      else
        data.statusCrawlerDir = null;

      data.lastStatusTaskType = taskType;

      if (logInfo)
        log.silly(`${_logKey}${func}(${taskType}) - ${data.statusCrawlerTask}:`, logInfo);
      else
        log.silly(`${_logKey}${func}(${taskType}) - ${data.statusCrawlerTask}`);

    } catch(err) {
      log.error(`${_logKey}${func} -`, err);
    }
  }

  // ........................................................

  onTimerProcessForgotten() {
    this.processTask();
  }

  // ........................................................

  onTimerStatusCrawler() {
    const func = '.onTimerStatusCrawler'; // eslint-disable-line no-unused-vars

    const { data } = this;

    if (data.statusExistDataCrawler) {
      const { statusCrawlerTask, statusCrawlerDir } = this.data;
      const workerState = this.objects.storeManager.workerState;

      const prio = WorkerReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);
      const statusRemainingDirs = workerState.tasks[prio].length;

      const action = statusActions.createActionRunning(statusCrawlerTask, statusCrawlerDir, statusRemainingDirs);
      this.objects.storeManager.dispatchTask(action);

      data.statusExistDataCrawler = false;
    }
  }

  // ........................................................

  onTimerStatusDb() {
    const func = '.onTimerStatusDb';

    const instance = this;
    const {data} = instance;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;

    if (!data.statusExistDataDb)
      return Promise.resolve();
    data.statusExistDataDb = false;

    let countDbDirs = null;

    const p = dbWrapper.countDirs().then((count) => {

      countDbDirs = count;
      return dbWrapper.countFiles();

    }).then((countDbFiles) => {

      const action = statusActions.createActionDb(countDbDirs, countDbFiles);
      storeManager.dispatchTask(action);

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;

  }

  // ........................................................
}

// ----------------------------------------------------------------------------------

