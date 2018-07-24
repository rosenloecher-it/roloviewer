import deepEquals from 'deep-equal';
import deepmerge from 'deepmerge';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import set from 'collections/set';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import * as crawlerProgressActions from "../../common/store/crawlerProgressActions";
import {CrawlerBase} from "./crawlerBase";
import * as actionsSlideshow from "../../common/store/slideshowActions";
import {MediaComposer} from "./mediaComposer";
import {MediaLoader} from "./mediaLoader";
import {CrawlerTasksReducer} from "../../common/store/crawlerTasksReducer";
import {MediaFilter} from "./mediaFilter";

// ----------------------------------------------------------------------------------

const _logKey = "mediaCrawler";

// ----------------------------------------------------------------------------------

export class MediaCrawler extends CrawlerBase {

  constructor() {
    super();

    this.data = {
      cacheScanFsDirs: null,
      lastAutoSelectedDir: null,

      progressDbSend: false,
      progressRunningSend: false,

      progressCurrentTask: null,
      progressCurrentDir: null,
      progressRemainingDirs: null,

      timerProgressRunning: null,
      timerProgressDb: null,
    }

    this.onTimerProgressRunning = this.onTimerProgressRunning.bind(this);
    this.onTimerProgressDb = this.onTimerProgressDb.bind(this);


  }

  // ........................................................

  init() {

    const {data} = this;

    const p = super.init().then(() => {

      data.timerProgressRunning = setInterval(this.onTimerProgressRunning, 1000);
      data.timerProgressDb = setInterval(this.onTimerProgressDb, 5000);

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;

  }

  // ........................................................

  shutdown() {
    const func = '.shutdown';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    const p = super.shutdown().then(() => {

      return dbWrapper.saveState(crawlerState);

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;

  }

  // ........................................................

  addAutoSelectFiles(trailNumber) {
    // AR_WORKER_OPEN
    const func = '.addAutoSelectFiles';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    const p = dbWrapper.listDirsWeigthSorted().then((dirItems) => {

      if (0 === dirItems.length)
        throw new Error('auto-selection failed (no dirs available)!');

      let selectedDir = null;
      let counterPreventLastProposal = 0;
      do {
        const selected = mediaComposer.randomWeighted(dirItems.length);

        selectedDir = dirItems[selected].dir;
        counterPreventLastProposal++;

        if (dirItems.length < 3 || counterPreventLastProposal >= 3)
          break;

        if (selectedDir === instance.data.lastAutoSelectedDir)
          continue;

      } while (false);

      instance.data.lastAutoSelectedDir = selectedDir;

      return dbWrapper.loadDir(selectedDir);
    }).then((dirItem) => {

      const fileItems = mediaComposer.randomSelectFilesFromDir(dirItem, crawlerState.batchCount, true);
      if (fileItems.length === 0) {

        if (trailNumber < 2) {
          const newAction = actionsCrawlerTasks.createActionOpen (null, null, trailNumber + 1);
          storeManager.dispatchTask(newAction);
        } else
          throw new Error(`auto-selection failed (no items delivered - ${trailNumber}x)!`);

      } else {
        const files = [];
        for (let i = 0; i < fileItems.length; i++)
          files.push(path.join(dirItem.dir, fileItems[i].fileName));
        const slideshowItems = actionsSlideshow.createItems(files);
        const action = actionsSlideshow.createActionAddAutoFiles(slideshowItems);
        storeManager.dispatchGlobal(action);
      }

      return Promise.resolve();
    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    // list dirs after rating and select_sqrt
    // select fileItems (sqrt) with list
    // check time stamps not to near and select again

    return p;
  }

  // ........................................................

  static prepareStateNoRescan(statusIn) {

    if (!statusIn)
      return null;

    const status = deepmerge.all([ statusIn, {} ]);

    if (status.batchCount !== undefined)
      delete status.batchCount;
    if (status.updateDirsAfterMinutes !== undefined)
      delete status.updateDirsAfterMinutes;

    return status;
  }

  static equalsStateNoRescan(status1In, status2In) {

    const status1 = MediaCrawler.prepareStateNoRescan(status1In);
    const status2 = MediaCrawler.prepareStateNoRescan(status2In);

    return deepEquals(status1, status2);
  }

  // ........................................................

  saveState() {
    const func = '.saveState';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const tasksState = storeManager.crawlerTasksState;

    const prio = CrawlerTasksReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);

    const stateComposed = {
      lastConfig: crawlerState,
      lastUpdateDirs: [],
    }

    const dirTasks = tasksState.tasks[prio];
    for (let i = 0; i < dirTasks.length; i++) {
      const task = dirTasks[i];
      stateComposed.lastUpdateDirs.push(task.payload);
    }

    const p = dbWrapper.saveState(stateComposed).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  loadState() {
    const func = '.loadState';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerStateCurrent = storeManager.crawlerState;

    const p = dbWrapper.loadState().then((stateComposed) => {

      let rescanAll = false;

      if (!MediaCrawler.equalsStateNoRescan(crawlerStateCurrent, stateComposed.lastConfig)) {
        log.info(`${_logKey}${func} - config changed => restart crawle`);
        rescanAll = true;
      }

      if (stateComposed.lastUpdateDirs) {
        let action = null;

        action = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action);

        const {lastUpdateDirs} = stateComposed;
        for (let i = 0; i < lastUpdateDirs.length; i++) {
          action = actionsCrawlerTasks.createActionUpdateDir(lastUpdateDirs[i]);
          storeManager.dispatchTask(action);
        }
      }

      return Promise.resolve({rescanAll});
    });

    return p;
  }

  // ........................................................

  initCrawler() {
    // AR_WORKER_INIT_CRAWLE
    const func = '.initCrawler';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    this.setProgressInit();

    const p = this.loadState().then((argsLoadState) => {

      let action = null;

      action = actionsCrawlerTasks.createActionReloadDirs(argsLoadState.rescanAll);
      storeManager.dispatchTask(action);

      return dbWrapper.listDirsAll();

    }).then((dirItems) => {

      let action = null;

      instance.data.cacheScanFsDirs = new Set();

      const dirs = [];
      for (let i = 0; i < dirItems.length; i++) {
        const dirItem = dirItems[i];
        dirs.push(dirItem.dir);
        instance.data.cacheScanFsDirs.add(dirItem.dir);
      }

      action = actionsCrawlerTasks.createActionRemoveDirs(dirs);
      storeManager.dispatchTask(action);

      for (let i = 0; i < crawlerState.folderSource.length; i++) {
        action = actionsCrawlerTasks.createActionScanFsDir(crawlerState.folderSource[i]);
        storeManager.dispatchTask(action);
      }

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  reloadDirs({rescanAll}) {
    // AR_WORKER_RELOAD_DIRS
    const func = '.reloadDirs';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    this.setProgressInit();

    let p = null;

    if (rescanAll)
      p = dbWrapper.listDirsAll();
    else
      p = dbWrapper.listDirsToUpdate(crawlerState.updateDirsAfterMinutes);

    p.then((dirItems) => {

      let action = null;

      if (rescanAll) {
        // reset old tasks
        action = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_FILES);
        storeManager.dispatchTask(action);
        action = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action);
      }

      for (let i = 0; i < dirItems.length; i++) {
        const dirItem = dirItems[i];
        action = actionsCrawlerTasks.createActionUpdateDir(dirItem.dir);
        storeManager.dispatchTask(action);
      }

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  removeDirs({dirs}) {
    // AR_WORKER_REMOVE_DIRS
    const func = '.removeDirs';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const { folderBlacklist, folderBlacklistSnippets } = crawlerState;

    this.setProgressRemoveDirs();

    const maxCheckCount = 20;
    let dirRemove = null;
    let loopCounter = 0;
    const loopMax = Math.min(maxCheckCount, dirs.length);

    for (loopCounter = 0; loopCounter < loopMax; loopCounter++) {
      const dir = dirs[loopCounter];

      if (!fs.lstatSync(dir).isDirectory()) {
        dirRemove = dir;
        break;
      }

      if (MediaFilter.shouldSkipFolder(dir, folderBlacklist, folderBlacklistSnippets)) {
        dirRemove = dir;
        break;
      }
    }

    if (loopCounter < dirs.length) {
      const dirsNew = dirs.slice(loopCounter + 1);
      const action = actionsCrawlerTasks.createActionRemoveDirs(dirsNew);
      storeManager.dispatchTask(action);
    }

    let p = null;

    if (!dirRemove) {
      p = dbWrapper.removeDir(dirRemove).catch((err) => {
        this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
      });
    } else
      p = Promise.resolve();

    return p;
  }

  // .......................................................

  scanFsDir(dir) {
    // AR_WORKER_SCAN_FSDIR
    const func = '.scanFsDir';

    const instance = this;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const { folderBlacklist, folderBlacklistSnippets } = crawlerState;

    this.setProgressScanFs();

    const children = fs.readdirSync(dir);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      const fileLong = path.join(dir, fileShort);
      if (fs.lstatSync(fileLong).isDirectory()) {
        if (MediaFilter.shouldSkipFolder(fileLong, folderBlacklist, folderBlacklistSnippets))
          log.info(`${_logKey}${func} - skipped: ${fileLong}`);
        else {

          if (!instance.data.cacheScanFsDirs.has(fileLong)) {
            let action = null;

            action = actionsCrawlerTasks.createActionScanFsDir(fileLong);
            storeManager.dispatchTask(action);

            action = actionsCrawlerTasks.createActionUpdateDir(fileLong);
            storeManager.dispatchTask(action);

          } // else: do nothing - dir exists already in db
        }
      }
    }

    return Promise.resolve();
  }

  // .......................................................

  rateDirByFile(file) {
    // AR_WORKER_RATE_DIR_BY_FILE
    const func = '.rateDirByFile';

    const instance = this;
    const {dbWrapper} = this.objects;
    const {mediaComposer} = instance.objects;

    const dirName = path.dirname(file);
    const fileName = path.basename(file);

    //log.debug(`${_logKey}${func} - in:`, file);

    const p = dbWrapper.loadDir(dirName).then((dirItem) => {

      if (dirItem) {
        mediaComposer.rateDirByShownFile(dirItem, fileName);
        return dbWrapper.saveDir(dirItem);
      }

      log.error(`${_logKey}${func}.promise - cannot find parent for item (${file})!`);
      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  updateFiles(payload) {
    // AR_WORKER_UPDATE_FILES - only updates or add files - no remove!
    const func = '.updateFiles';

    const {folder, fileNames} = payload;

    this.setProgressUpdate(folder);

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {metaReader} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    let dirItem = null;

    const p = dbWrapper.loadDir(folder).then((dirItemDb) => {

      dirItem = dirItemDb;
      if (!dirItem)
        dirItem = mediaComposer.createDirItem(folder);

      const promises = [];

      for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        let fileItem = mediaComposer.findFileItem(dirItem, fileName);
        if (!fileItem) {
          fileItem = mediaComposer.createFileItem({fileName});
          dirItem.fileItems.push(fileItem);
        }

        const filePath = path.join(dirItem.dir, fileItem.fileName);
        fileItem.lastModified = MediaComposer.lastModifiedFromFile(filePath);
        promises.push(metaReader.loadMeta(filePath));

        if (dirItem.fileItems.length >= crawlerState.maxFilesPerFolder) {
          log.warn(`${_logKey}${func} - maxFilesPerFolder (${crawlerState.maxFilesPerFolder} => skip remaining files!!`);
          break;
        }
      }

      return Promise.all(promises);

    }).then((values) => {

      for (let i = 0; i < values.length; i++) {
        const meta = values[i];
        mediaComposer.updateFileMeta(dirItem, meta)
      }
      mediaComposer.evaluateDir(dirItem);

      return dbWrapper.saveDir(dirItem);

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  checkAndHandleChangedFileItems(dirItem, fileNamesFs) {

    let doFileItemsSave = false;

    const fileItemsOld = dirItem.fileItems;
    const fileItemsNew = [];
    const itemUpdate = [];

    const setFs = new Set();
    for (let i = 0; i < fileNamesFs.length; i++) {
      const fileName = fileNamesFs[i];
      setFs.add(fileName, fileName);
    }

    for (let i = 0; i < fileItemsOld.length; i++) {
      const fileItem = fileItemsOld[i];

      if (setFs.has(fileItem.fileName)) {

        const filePath = path.join(dirItem.dir, fileItem.fileName);
        const lastChange = MediaComposer.lastModifiedFromFile(filePath);
        if (lastChange !== fileItem.lastModified) {

          //fileItem.lastModified = lastChange;
          // item changed
          doFileItemsSave = true;
          itemUpdate.push(fileItem.fileName);
        } // else: just add (to update list, update will be done later)
        fileItemsNew.push(fileItem);

        setFs.delete(fileItem.fileName); // remaining items will be the new ones

      } else {
        // item does not exits any more => remove / don't add
        doFileItemsSave = true;
      }
    }

    for (const fileName of setFs) {
      const fileItem =  this.objects.mediaComposer.createFileItem({fileName});
      fileItemsNew.push(fileItem);
      itemUpdate.push(fileItem.fileName);
      doFileItemsSave = true;
    }

    // TODO save also when: dirItem.lastUpdate < xxxx (weigth season)

    if (doFileItemsSave) {
      dirItem.fileItems = fileItemsNew;

      this.objects.mediaComposer.evaluate(dirItem); // fileItems will be sorted

      dirItem.lastUpdate = new Date().getTime();

      if (itemUpdate.length > 0) {
        let actionItems = [];
        for (let i = 0; i < itemUpdate.length; i++) {
          actionItems.push(itemUpdate[i]);
          if (actionItems.length === 10 || i === itemUpdate.length - 1) {
            const action = actionsCrawlerTasks.createActionUpdateFiles(dirItem.dir, actionItems);
            this.objects.storeManager.dispatchTask(action);
            actionItems = [];
          }
        }
      }
    }

    return doFileItemsSave;
  }

  // .......................................................

  updateDir(folder) {
    // AR_WORKER_UPDATE_DIR
    const func = '.updateDir';

    //log.debug(`${_logKey}${func} - in: ${folder}`);

    if (!folder)
      return Promise.resolve();

    this.setProgressUpdate(folder);

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    if (!fs.lstatSync(folder).isDirectory()) {
      log.info(`${_logKey}${func} - no dir: ${folder}`);
      return Promise.resolve();
    }
    if (MediaFilter.shouldSkipFolder(folder, crawlerState.folderBlacklist, crawlerState.folderBlacklistSnippets)) {
      log.info(`${_logKey}${func} - blacklisted: ${folder}`);
      return Promise.resolve();
    }

    const children = MediaFilter.listFiles(folder);

    const p = dbWrapper.loadDir(folder).then((dirItem) => {

      if (!dirItem)
        dirItem = mediaComposer.createDirItem({dir: folder});

      //log.debug(`${_logKey}${func} - dirItem:`, dirItem);
      //log.debug(`${_logKey}${func} - children:`, children);

      if (instance.checkAndHandleChangedFileItems(dirItem, children))
        return dbWrapper.saveDir(dirItem);

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  setProgressCommon() {
    const { data } = this
    const crawlerTasksState = this.objects.storeManager.crawlerTasksState;

    const prio = CrawlerTasksReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);

    data.progressRemainingDirs = crawlerTasksState.tasks[prio].length;

    data.progressDbSend = true;
    data.progressRunningSend = true;

  }

  setProgressInit() {
    const { data } = this

    this.setProgressCommon();

    data.progressCurrentTask = 'Initialising';
    data.progressCurrentDir = null;
  }

  setProgressRemoveDirs() {
    const { data } = this

    this.setProgressCommon();

    data.progressCurrentTask = 'Removing folders';
    data.progressCurrentDir = null;
  }

  setProgressScanFs() {
    const { data } = this

    this.setProgressCommon();

    data.progressCurrentTask = 'Scanning folders';
    data.progressCurrentDir = null;
  }

  setProgressUpdate(dir) {
    const { data } = this;

    this.setProgressCommon();

    data.progressCurrentTask = 'Updating folders';
    data.progressCurrentDir = dir;
  }

  setProgressReady() {
    const { data } = this;

    this.setProgressCommon();

    data.progressCurrentTask = 'Ready';
    data.progressCurrentDir = null;
  }

  // ........................................................

  onTimerProgressRunning() {

    if (this.progressRunningSend) {
      const { progressRemainingDirs, progressCurrentTask, progressCurrentDir } = this.data;

      const action = crawlerProgressActions.createActionRunning(progressCurrentTask, progressCurrentDir, progressRemainingDirs);
      this.objects.storeManager.dispatchTask(action);

      this.progressRunningSend = false;
    }
  }

  // ........................................................

  onTimerProgressDb() {
    const func = '.onTimerProgressDb';

    const instance = this;
    const {data} = instance;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;

    if (!data.progressDbSend)
      return Promise.resolve();
    data.progressDbSend = false;

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

