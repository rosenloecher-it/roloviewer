import deepEquals from 'deep-equal';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import set from 'collections/set';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
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
    }

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


    const p = dbWrapper.listDirsWeigthSorted().then((files) => {

      if (0 === files.length)
        throw new Error('auto-selection failed (no dirs delivered)!');

      const selected = mediaComposer.randomWeighted(files.length);

      const selectedFile = files[selected];

      return dbWrapper.loadDoc(selectedFile);
    }).then((dir) => {

      const files = mediaComposer.randomSelectFilesFromDir(dir, crawlerState.batchCount, true);
      if (files.length === 0) {

        if (trailNumber < 2) {
          const newAction = actionsCrawlerTasks.createActionOpen (null, null, trailNumber + 1);
          storeManager.dispatchTask(newAction);
        } else
          throw new Error(`auto-selection failed (no items delivered - ${trailNumber}x)!`);

      } else {
        const items = actionsSlideshow.createItems(files);
        const action = actionsSlideshow.createActionAddAutoFiles(items);
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

  static compareStatus(status1, status2) {

    return deepEquals(status1, status2);
  }

  // ........................................................

  saveState() {

    const instance = this;
    const {dbWrapper} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const tasksState = storeManager.crawlerTasksState;

    const prio = CrawlerTasksReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);

    const stateComposed = {
      lastConfig: crawlerState,
      lastUpdateDirs: [],
    }

    const dirTasks = tasksState.tasks[prio];
    for (let i = 0; i < dirTasks.length; i++) {
      const task = dirTask[i];
      stateComposed.lastUpdateDirs.push(task.payload);
    }

    const p = dbWrapper.saveState(stateComposed).then(() => {
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

      if (!MediaCrawler.compareStatus(crawlerStateCurrent, stateComposed.lastConfig)) {
        log.info(`${_logKey}${func} - config changed => restart crawle`);
        rescanAll = true;
      }

      if (stateComposed.lastUpdateDirs) {
        const {lastUpdateDirs} = stateComposed;
        for (let i = 0; i < lastUpdateDirs.length; i++) {
          const action = actionsCrawlerTasks.createActionUpdateDirs(lastUpdateDirs[i]);
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

    const p = this.loadState().then((argsLoadState) => {

      let action = null;

      action = actionsCrawlerTasks.createActionReloadDirs(argsLoadState.rescanAll);
      storeManager.dispatchTask(action);

      return dbWrapper.listDirsAll();

    }).then((dirItems) => {

      log.debug(`${_logKey}${func}.promise.2: dirItems=`, dirItems);

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

    const lastUpdatedInMinutes = 60 * 24 * 2;

    let p = null;

    if (rescanAll)
      p = dbWrapper.listDirsAll();
    else
      p = dbWrapper.listDirsToUpdate(lastUpdatedInMinutes);

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

  rateDirByFile({file}) {
    // AR_WORKER_RATE_DIR_BY_FILE
    const func = '.rateDirByFile';

    const instance = this;
    const {dbWrapper} = this.objects;
    const {mediaComposer} = instance.objects;

    const dirName = path.dirname(file);
    const fileName = path.basename(file);

    const p = dbWrapper.loadDoc(dirName).then((dirItem) => {

      if (dirItem) {
        mediaComposer.evaluateFile(dirItem, fileName);

        mediaComposer.evaluateDir(dirItem);

        return dbWrapper.saveDoc(dirItem);

      } else
        throw new Error(`cannot find parent for item (${file})!`);

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

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {metaReader} = instance.objects;

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

    if (doFileItemsSave) {
      dirItem.fileItems = fileItemsNew;

      this.objects.mediaComposer.evaluateDir(dirItem); // fileItems will be sorted

      dirItem.lastModified = new Date().getTime();

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

    log.info(`${_logKey}${func} - in: ${folder}`);

    if (!folder)
      return Promise.resolve();

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

}

// ----------------------------------------------------------------------------------

