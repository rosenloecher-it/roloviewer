import deepEquals from 'deep-equal';
import deepmerge from 'deepmerge';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import set from 'collections/set';
import * as constants from "../../common/constants";
import * as workerActions from "../../common/store/workerActions";
import {CrawlerBase} from "./crawlerBase";
import * as rendererActions from "../../common/store/rendererActions";
import {MediaComposer} from "./mediaComposer";
import {WorkerReducer} from "../../common/store/workerReducer";
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
      scanActiveSendFirstAutoSelect: false,
    };

  }

  // ........................................................

  shutdown() {
    const func = '.shutdown';

    const instance = this;

    const p = super.shutdown().then(() => {

      return this.saveState();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  deactivateAutoSelect() {
    this.data.scanActiveSendFirstAutoSelect = false;
  }

  // ........................................................

  autoSelectFiles(input) {
    // AR_WORKER_AUTO_SELECT
    const func = '.autoSelectFiles';

    try {

      let rescanAll = false;
      if (input.rescanAll !== null && input.rescanAll !== undefined)
        rescanAll = input.rescanAll;

      if (rescanAll === true)
        return this.rescanAllAndAutoSelect();

      return this.addAutoSelectFiles();

    } catch (err) {
      this.logAndShowError(`${_logKey}${func}.promise.catch`, err);
      return Promise.resolve();
    }

  }

  // ........................................................

  addAutoSelectFiles() {
    // AR_WORKER_AUTO_SELECT
    const func = '.addAutoSelectFiles';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    const p = dbWrapper.listDirsWeigthSorted().then((dirItems) => {

      if (0 === dirItems.length) {
        if (this.data.scanActiveSendFirstAutoSelect) {
          log.debug(`${_logKey}${func} - scan active - skip and wait for first delivery`);
          return Promise.resolve();
        }

        throw new Error('auto-selection failed (no dirs available)!');
      }

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
        throw new Error(`auto-selection failed (no items delivered)!`);

      } else {
        let action = null;

        const removeOldItems = instance.data.scanActiveSendFirstAutoSelect;
        instance.data.scanActiveSendFirstAutoSelect = false;

        const files = [];
        for (let i = 0; i < fileItems.length; i++)
          files.push(path.join(dirItem.dir, fileItems[i].fileName));
        const slideshowItems = rendererActions.createMediaItems(files);
        action = rendererActions.createActionAddAutoFiles(slideshowItems, removeOldItems);
        storeManager.dispatchGlobal(action);

        for (let i = 0; i < files.length; i++) {
          action = workerActions.createActionDeliverMeta(files[i]);
          //log.debug(`${_logKey}${func} - action:`, action);
          storeManager.dispatchGlobal(action);
        }
      }



      return Promise.resolve();
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
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
    const func = '.equalsStateNoRescan';

    const status1 = MediaCrawler.prepareStateNoRescan(status1In);
    const status2 = MediaCrawler.prepareStateNoRescan(status2In);

    const result = deepEquals(status1, status2);

    // if (!result) {
    //   log.debug(`${_logKey}${func} - config changed - status1=`, status1);
    //   log.debug(`${_logKey}${func} - config changed - status2=`, status2);
    // }

    return result;
  }

  // ........................................................

  saveState() {
    const func = '.saveState';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const workerState = storeManager.workerState;

    const prio = WorkerReducer.getTaskPrio(constants.AR_WORKER_UPDATE_DIR);

    const stateComposed = {
      lastConfig: crawlerState,
      lastUpdateDirs: [],
    };

    const dirTasks = workerState.tasks[prio];
    for (let i = 0; i < dirTasks.length; i++) {
      const task = dirTasks[i];
      stateComposed.lastUpdateDirs.push(task.payload);
    }

    const p = dbWrapper.saveState(stateComposed).then(() => {
      log.debug(`${_logKey}${func} - done`);
      return Promise.resolve();
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
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
        log.info(`db config changed => restart crawle`);
        rescanAll = true;
      }

      if (stateComposed.lastUpdateDirs) {
        let action = null;

        action = workerActions.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action);

        const {lastUpdateDirs} = stateComposed;
        for (let i = 0; i < lastUpdateDirs.length; i++) {
          action = workerActions.createActionUpdateDir(lastUpdateDirs[i]);
          storeManager.dispatchTask(action);
        }
      }

      return Promise.resolve({rescanAll});
    });

    return p;
  }

  // ........................................................

  rescanAllAndAutoSelect() {
    // part of AR_WORKER_OPEN_FOLDER
    const func = '.rescanAllAndAutoSelect';

    log.debug(`${_logKey}${func} - in`);

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const {data} = instance;

    data.scanActiveSendFirstAutoSelect = true;

    const p = dbWrapper.listDirsAll().then((dirs) => {
      let action;
      const tasksTypesToRemove = [
        constants.AR_WORKER_REMOVE_DIRS,
        constants.AR_WORKER_RELOAD_DIRS,
        constants.AR_WORKER_SCAN_FSDIR,
        constants.AR_WORKER_RATE_DIR_BY_FILE,
        constants.AR_WORKER_UPDATE_FILES,
        constants.AR_WORKER_UPDATE_DIR,
      ];

      for (let i = 0; i < tasksTypesToRemove.length; i++) {
        action = workerActions.createActionRemoveTaskTypes(tasksTypesToRemove[i]);
        storeManager.dispatchTask(action);
      }

      for (let i = 0; i < crawlerState.folderSource.length; i++) {
        const folderSource = crawlerState.folderSource[i];
        log.debug(`${_logKey}${func} - queue source folder:`, folderSource);
        action = workerActions.createActionScanFsDir(folderSource);
        storeManager.dispatchTask(action);
      }

      return dbWrapper.clearDbDir();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  start(activeAutoSelect = false) {
    // AR_WORKER_START
    const func = '.start';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const {data} = instance;

    if (activeAutoSelect)
      data.scanActiveSendFirstAutoSelect = true;

    const p = this.loadState().then((argsLoadState) => {

      let action = null;

      action = workerActions.createActionReloadDirs(argsLoadState.rescanAll);
      storeManager.dispatchTask(action);

      return dbWrapper.countDirsShowable();

    }).then((countDirsShowable) => {

      if (data.scanActiveSendFirstAutoSelect && countDirsShowable > 0)
        return this.addAutoSelectFiles();

      return Promise.resolve();

    }).then(() => {

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

      action = workerActions.createActionRemoveDirs(dirs);
      storeManager.dispatchTask(action);

      if (crawlerState.folderSource.length === 0)
        log.warn(`${_logKey}${func} - no source folder configured!`);

      for (let i = 0; i < crawlerState.folderSource.length; i++) {
        action = workerActions.createActionScanFsDir(crawlerState.folderSource[i]);
        storeManager.dispatchTask(action);
      }

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
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

    let p = null;

    if (rescanAll)
      p = dbWrapper.listDirsAll();
    else
      p = dbWrapper.listDirsToUpdate(crawlerState.updateDirsAfterMinutes);

    p.then((dirItems) => {

      let action = null;

      if (rescanAll) {
        // reset old tasks
        action = workerActions.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_FILES);
        storeManager.dispatchTask(action);
        action = workerActions.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action);
      }

      for (let i = 0; i < dirItems.length; i++) {
        const dirItem = dirItems[i];
        action = workerActions.createActionUpdateDir(dirItem.dir);
        storeManager.dispatchTask(action);
      }

      if (!rescanAll)
        log.debug(`${_logKey}${func} - ${dirItems.length} folder queued for update.`);

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
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

      if (MediaFilter.isFolderBlacklisted(dir, folderBlacklist, folderBlacklistSnippets)) {
        dirRemove = dir;
        break;
      }
    }

    if (loopCounter < dirs.length) {
      const dirsNew = dirs.slice(loopCounter + 1);
      const action = workerActions.createActionRemoveDirs(dirsNew);
      storeManager.dispatchTask(action);
    }

    let p = null;

    if (dirRemove) {
      p = dbWrapper.removeDir(dirRemove).catch((err) => {
        instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
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

    let childrenDirs = [];

    const children = fs.readdirSync(dir);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      const fileLong = path.join(dir, fileShort);
      if (fs.lstatSync(fileLong).isDirectory()) {
        if (MediaFilter.isFolderBlacklisted(fileLong, folderBlacklist, folderBlacklistSnippets))
          log.info(`${_logKey}${func} - skipped: ${fileLong}`);
        else {
          if (!instance.data.cacheScanFsDirs.has(fileLong))
            childrenDirs.push(fileLong);
          // else: do nothing - dir exists already in db
        }
      }
    }

    // thumble dirs (!!!) so that you don't get the first folder
    if (this.data.scanActiveSendFirstAutoSelect)
      childrenDirs = MediaFilter.tumbleArray(childrenDirs);

    for (let i = 0; i < childrenDirs.length; i++) {
      const childDir = childrenDirs[i];

      let action = workerActions.createActionScanFsDir(childDir);
      storeManager.dispatchTask(action);

      action = workerActions.createActionUpdateDir(childDir);
      storeManager.dispatchTask(action);
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
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  updateFiles(payload) {
    // AR_WORKER_UPDATE_FILES - only updates or add files - no remove!
    const func = '.updateFiles';

    const {folder, fileNames} = payload;

    const instance = this;
    const {data} = instance;
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

      if (fileNames.length === 0 || instance.data.processingStopped)
        return Promise.resolve([]);

      let p = Promise.resolve();
      for (let i = 0; i < fileNames.length; i++) {

        if (this.data.processingStopped)
          break;

        const fileName = fileNames[i];
        let fileItem = mediaComposer.findFileItem(dirItem, fileName);
        if (!fileItem) {
          fileItem = mediaComposer.createFileItem({fileName});
          dirItem.fileItems.push(fileItem);
        }

        const filePath = path.join(dirItem.dir, fileItem.fileName);
        fileItem.lastModified = MediaComposer.lastModifiedFromFile(filePath);

        const p2 = metaReader.loadMeta(filePath).then((meta) => {
          if (meta)
            mediaComposer.updateFileMeta(dirItem, meta);
          return Promise.resolve();
        });
        p = p.then(() => { return p2; });

      }

      return p;

    }).then(() => {

      mediaComposer.evaluateDir(dirItem);

      return dbWrapper.saveDir(dirItem);

    }).then(() => {

      if (data.scanActiveSendFirstAutoSelect)
        return instance.addAutoSelectFiles();

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  checkAndHandleChangedFileItems(dirItem, fileNamesFs) {
    const func = '.checkAndHandleChangedFileItems';

    let doFileItemsSave = false;

    const crawlerState = this.objects.storeManager.crawlerState;
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
          // item is changed! but save lastModified in updatesFiles!
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

    // updating seasonWeight
    if (crawlerState.weightingSeason <= 0.5 || doFileItemsSave) {
      const seasonShift = constants.DEFCONF_CRAWLER_TODAY_SHIFT_SEASON * 24 * 60 * 60 * 1000
      const minUpdateTime = new Date().getTime() - seasonShift;
      if (dirItem.lastUpdate >= minUpdateTime) {
        log.debug(`${_logKey}${func} - force evaluation: ${dirItem.dir}`);
        doFileItemsSave = true;
      }
    }

    if (doFileItemsSave) {
      dirItem.fileItems = fileItemsNew;

      this.objects.mediaComposer.evaluate(dirItem); // fileItems will be sorted

      dirItem.lastUpdate = new Date().getTime();

      if (itemUpdate.length > 0) {
        let actionItems = [];
        for (let i = 0; i < itemUpdate.length; i++) {
          actionItems.push(itemUpdate[i]);
          if (actionItems.length === 10 || i === itemUpdate.length - 1) {
            const action = workerActions.createActionUpdateFiles(dirItem.dir, actionItems);
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

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    if (!fs.lstatSync(folder).isDirectory()) {
      log.info(`${_logKey}${func} - no dir: ${folder}`);
      return Promise.resolve();
    }
    if (MediaFilter.isFolderBlacklisted(folder, crawlerState.folderBlacklist, crawlerState.folderBlacklistSnippets)) {
      log.info(`${_logKey}${func} - blacklisted: ${folder}`);
      return Promise.resolve();
    }

    const children = MediaFilter.listMediaFilesShort(folder);

    const p = dbWrapper.loadDir(folder).then((dirItem) => {

      if (!dirItem)
        dirItem = mediaComposer.createDirItem({dir: folder});

      //log.debug(`${_logKey}${func} - dirItem:`, dirItem);
      //log.debug(`${_logKey}${func} - children:`, children);

      if (instance.checkAndHandleChangedFileItems(dirItem, children))
        return dbWrapper.saveDir(dirItem);

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................


}

// ----------------------------------------------------------------------------------

