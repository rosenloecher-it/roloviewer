import deepEquals from 'deep-equal';
import deepmerge from 'deepmerge';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import * as constants from '../../common/constants';
import * as fileUtils from '../../common/utils/fileUtils';
import * as workerActions from '../../common/store/workerActions';
import { CrawlerBase } from './crawlerBase';
import * as rendererActions from '../../common/store/rendererActions';
import { MediaComposer } from './mediaComposer';
import { WorkerReducer } from '../../common/store/workerReducer';
import { MediaFilter } from './mediaFilter';
import { FifoSelectLimit } from "./fifoSelectLimit";

// ----------------------------------------------------------------------------------

const _logKey = 'mediaCrawler';

// ----------------------------------------------------------------------------------

export class MediaCrawler extends CrawlerBase {

  constructor() {
    super();

    this.data = {
      cacheScanFsDirs: new Set(),
      fifoSelectLimit: new FifoSelectLimit(),
      scanActiveSendFirstAvailableFiles: false,
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
    this.data.scanActiveSendFirstAvailableFiles = false;
  }

  // ........................................................

  autoSelectFiles(input) {
    // AR_WORKER_AUTO_SELECT
    const func = '.autoSelectFiles';

    try {
      let configChanged = false;
      if (input.configChanged !== null && input.configChanged !== undefined)
        configChanged = input.configChanged;

      if (configChanged === true)
        return this.rescanAllAndAutoSelect();

      return this.chooseAndSendFiles();

    } catch (err) {
      this.logAndShowError(`${_logKey}${func}.promise.catch`, err);
      return Promise.resolve();
    }
  }

  // ........................................................

  chooseDirItem() {
    const func = '.chooseDirItem';

    const instance = this;
    const { dbWrapper } = instance.objects;
    const { mediaComposer } = instance.objects;
    const { storeManager } = instance.objects;
    const { fifoSelectLimit } = instance.data;

    const p = dbWrapper.listDirsWeigthSorted().then(dirItems => {

      if (0 === dirItems.length) {
        if (instance.data.scanActiveSendFirstAvailableFiles) {
          log.debug(`${_logKey}${func} - scan active - skip and wait for first delivery`);
        } else {
          const text = 'auto-selection failed (no dirs available)! Did you select a directory hierarchy which contains images!?';
          log.error(`${_logKey}${func} - ${text}`);
          storeManager.showMessage(constants.MSG_TYPE_ERROR, text);
        }

        return Promise.resolve(null, true); // dirItem, dontShowErrorWhenNull
      }

      fifoSelectLimit.setSize(Math.min(dirItems.length / 2, constants.DEFCONF_CRAWLER_DIR_REPEAT_LIMIT));
      fifoSelectLimit.clearCandidates();

      const maxSearchLoop = Math.min(5, dirItems.length);
      for (let i = 0; i < maxSearchLoop; i++) {
        const selected = mediaComposer.randomWeighted(dirItems.length);
        const selectedDirItem = dirItems[selected];

        if (fifoSelectLimit.setAndCheckCandidate(selectedDirItem.dir)) {
          break;
        }
      }

      const selectedDir = fifoSelectLimit.getCandidate();
      if (fifoSelectLimit.isRepeatedCandidate()) {
        log.debug(`${_logKey}${func} - selectedDir (${selectedDir}) exists in fifo!\n  elements: `, fifoSelectLimit.getElements());
      }

      fifoSelectLimit.add(selectedDir);

      return dbWrapper.loadDir(selectedDir);

    }).then(dirItem => {
      return Promise.resolve(dirItem, false); // dirItem, dontShowErrorWhenNull

    }).catch(err => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  chooseAndSendFiles() {
    const func = '.chooseAndSendFiles';

    const instance = this;
    const { mediaComposer } = instance.objects;
    const { storeManager } = instance.objects;
    const crawlerState = storeManager.crawlerState;

    const p = this.chooseDirItem().then((dirItem, dontShowErrorWhenNull) => {

      if (!dirItem) {
        if (!dontShowErrorWhenNull) {
          // could happen, when operations overlap
          if (!instance.data.scanActiveSendFirstAvailableFiles)
            log.error(`${_logKey}${func} - !dirItem`);
        }
        return Promise.resolve();
      }

      const fileItems = mediaComposer.randomSelectFilesFromDir(dirItem, crawlerState.batchCount, true);
      if (fileItems.length === 0) {
        throw new Error(`auto-selection failed (no items delivered)!`);

      } else {
        let action = null;

        const removeOldItemsFromViewList = instance.data.scanActiveSendFirstAvailableFiles;
        instance.data.scanActiveSendFirstAvailableFiles = false;

        const files = [];
        for (let i = 0; i < fileItems.length; i++)
          files.push(path.join(dirItem.dir, fileItems[i].fileName));
        const slideshowItems = rendererActions.createMediaItems(files);
        action = rendererActions.createActionAddAutoFiles(slideshowItems, removeOldItemsFromViewList);
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

    return p;
  }

  // ........................................................

  static prepareStateNoRescan(statusIn) {

    if (!statusIn)
      return null;

    const status = deepmerge.all([statusIn, {}]);

    if (status.batchCount !== undefined)
      delete status.batchCount;
    if (status.updateDirsAfterMinutes !== undefined)
      delete status.updateDirsAfterMinutes;

    return status;
  }

  static equalsStateNoRescan(status1In, status2In) {
    const func = '.equalsStateNoRescan'; // eslint-disable-line no-unused-vars

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
    const { dbWrapper } = instance.objects;
    const { storeManager } = instance.objects;
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
    const func = '.loadState'; // eslint-disable-line no-unused-vars

    const instance = this;
    const { dbWrapper } = instance.objects;
    const { storeManager } = instance.objects;
    const crawlerStateCurrent = storeManager.crawlerState;

    const p = dbWrapper.loadState().then((stateComposed) => {

      let configChanged = false;

      if (!MediaCrawler.equalsStateNoRescan(crawlerStateCurrent, stateComposed.lastConfig)) {
        log.info(`db config changed => restart crawle`);
        configChanged = true;
      }

      if (stateComposed.lastUpdateDirs) {
        let action = null;

        action = workerActions.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action);

        const {lastUpdateDirs} = stateComposed;
        for (let i = 0; i < lastUpdateDirs.length; i++) {
          action = workerActions.createActionUpdateDir(lastUpdateDirs[i], configChanged);
          storeManager.dispatchTask(action);
        }
      }

      return Promise.resolve({ configChanged });
    });

    return p;
  }

  // ........................................................

  rescanAllAndAutoSelect() {
    // part of AR_WORKER_OPEN_FOLDER
    const func = '.rescanAllAndAutoSelect';

    log.debug(`${_logKey}${func} - in`);

    const instance = this;
    const { dbWrapper } = instance.objects;
    const { storeManager } = instance.objects;
    const { data } = instance;

    data.scanActiveSendFirstAvailableFiles = true;

    const p = dbWrapper.listDirsAll().then(( /* dirs */) => {
      let action;
      const tasksTypesToRemove = [
        constants.AR_WORKER_REMOVE_DIRS,
        constants.AR_WORKER_PREPARE_DIRS_FOR_UPDATE,
        constants.AR_WORKER_SEARCH_FOR_NEW_DIRS,
        constants.AR_WORKER_RATE_DIR_BY_FILE,
        constants.AR_WORKER_UPDATE_DIRFILES,
        constants.AR_WORKER_UPDATE_DIR,
      ];

      for (let i = 0; i < tasksTypesToRemove.length; i++) {
        action = workerActions.createActionRemoveTaskTypes(tasksTypesToRemove[i]);
        storeManager.dispatchTask(action);
      }

      this.triggerSearchingSourceFolders();

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
    const { dbWrapper } = instance.objects;
    const { storeManager } = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const { data } = instance;

    if (activeAutoSelect)
      data.scanActiveSendFirstAvailableFiles = true;

    const p = this.loadState().then((argsLoadState) => {

      let action = null;

      action = workerActions.createActionPrepareDirsForUpdate(argsLoadState.configChanged);
      storeManager.dispatchTask(action);

      return dbWrapper.countDirsShowable();

    }).then((countDirsShowable) => {

      if (data.scanActiveSendFirstAvailableFiles && countDirsShowable > 0)
        return this.chooseAndSendFiles();

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

      if (crawlerState.sourceFolders.length === 0)
        log.warn(`${_logKey}${func} - no source folder configured!`);

      this.triggerSearchingSourceFolders();

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  prepareDirsForUpdate({ configChanged }) {
    // createActionPrepareDirsForUpdate / AR_WORKER_PREPARE_DIRS_FOR_UPDATE
    const func = '.prepareDirsForUpdate';

    const instance = this;
    const { dbWrapper } = instance.objects;
    const { storeManager } = instance.objects;
    const crawlerState = storeManager.crawlerState;

    let p = null;

    if (configChanged)
      p = dbWrapper.listDirsAll();
    else
      p = dbWrapper.listDirsToUpdate(crawlerState.updateDirsAfterMinutes);

    p.then((dirItems) => {

      let action = null;

      if (configChanged) {
        // reset old tasks
        action = workerActions.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIRFILES);
        storeManager.dispatchTask(action);
        action = workerActions.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action);
      }

      for (let i = 0; i < dirItems.length; i++) {
        const dirItem = dirItems[i];
        action = workerActions.createActionUpdateDir(dirItem.dir, configChanged);
        storeManager.dispatchTask(action);
      }

      log.debug(`${_logKey}${func} - ${dirItems.length} folder queued for update.`);

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  removeDirs({ dirs }) {
    // AR_WORKER_REMOVE_DIRS
    const func = '.removeDirs';

    const instance = this;
    const { dbWrapper } = instance.objects;
    const { storeManager } = instance.objects;
    const crawlerState = storeManager.crawlerState;
    const {sourceFolders, blacklistFolders, blacklistFolderSnippets} = crawlerState;

    const maxCheckCount = 20;
    let dirRemove = null;
    let loopCounter = 0;
    const loopMax = Math.min(maxCheckCount, dirs.length);

    for (loopCounter = 0; loopCounter < loopMax; loopCounter++) {
      const dir = dirs[loopCounter];

      if (!fileUtils.isDirectory(dir)) {
        dirRemove = dir;
        break;
      }

      const isFolderInsideSource = MediaFilter.isFolderInside(dir, sourceFolders);
      let isFolderBlacklisted = false;
      if (!isFolderInsideSource)
        isFolderBlacklisted = MediaFilter.isFolderBlacklisted(dir, blacklistFolders, blacklistFolderSnippets);
      if (!isFolderInsideSource || isFolderBlacklisted) {
        dirRemove = dir;
        break;
      }
    }

    if (loopCounter < dirs.length) {
      const dirsNew = dirs.slice(loopCounter + 1);
      const action = workerActions.createActionRemoveDirs(dirsNew);
      //log.debug(`${_logKey}${func} action=`, action);
      storeManager.dispatchTask(action);
    }

    let p = null;

    if (dirRemove) {
      p = dbWrapper.removeDir(dirRemove).catch(err => {
        instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
      });
    } else
      p = Promise.resolve();

    return p;
  }

  // .......................................................

  triggerSearchingSourceFolders() {
    const func = '.triggerSearchSourceFolder';
    const { storeManager } = this.objects;
    const crawlerState = storeManager.crawlerState;

    for (let i = 0; i < crawlerState.sourceFolders.length; i++) {
      const sourceFolder = crawlerState.sourceFolders[i];
      if (fileUtils.isDirectory(sourceFolder)) {
        log.debug(`${_logKey}${func} - queue source folder:`, sourceFolder);
        const action = workerActions.createActionSearchForNewDirs(sourceFolder);
        storeManager.dispatchTask(action);
      } else {
        const text = `source folder doesn't exist or is no valid directory (${sourceFolder})!`;
        log.error(`${_logKey}${func} - ${text}`);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, text);
      }
    }

    const action = workerActions.createActionCrawlerFinally();
    storeManager.dispatchTask(action);
  }

  // .......................................................

  searchForNewDirs(payload) {
    // AR_WORKER_SEARCH_FOR_NEW_DIRS
    const func = '.searchForNewDirs';

    const { dir } = payload;

    try {
      const instance = this;
      const { storeManager } = instance.objects;
      const crawlerState = storeManager.crawlerState;
      const { blacklistFolders, blacklistFolderSnippets } = crawlerState;

      if (!fileUtils.isDirectory(dir)) {
        log.error(
          `${_logKey}${func} - folder doesn't exist or is no valid directory (${dir})!`
        );
        return Promise.resolve();
      }

      let childrenDirs = [];

      const children = fs.readdirSync(dir);
      for (let k = 0; k < children.length; k++) {
        const fileShort = children[k];
        const fileLong = path.join(dir, fileShort);

        if (fileUtils.isDirectory(fileLong)) {
          const isFolderBlacklisted = MediaFilter.isFolderBlacklisted(fileLong, blacklistFolders, blacklistFolderSnippets );
          if (isFolderBlacklisted)
            log.info(`folder blacklisted => skipped: ${fileLong}`);
          else {
            if (!instance.data.cacheScanFsDirs.has(fileLong))
              childrenDirs.push(fileLong);
            // else: do nothing - dir exists already in db
          }
        }
      }

      // thumble dirs (!!!) so that you don't get the first folder
      //if (this.data.scanActiveSendFirstAvailableFiles)
      childrenDirs = MediaFilter.tumbleArray(childrenDirs);

      for (let i = 0; i < childrenDirs.length; i++) {
        const childDir = childrenDirs[i];

        let action = workerActions.createActionSearchForNewDirs(childDir);
        storeManager.dispatchTask(action);

        action = workerActions.createActionUpdateDir(childDir);
        storeManager.dispatchTask(action);
      }
    } catch (err) {
      log.error(`${_logKey}${func}(${dir}) - ${err}`);
    }

    return Promise.resolve();
  }

  // .......................................................

  rateDirByFile(file) {
    // AR_WORKER_RATE_DIR_BY_FILE
    const func = '.rateDirByFile';

    const instance = this;
    const { dbWrapper } = this.objects;
    const { mediaComposer } = instance.objects;

    const dirName = path.dirname(file);
    const fileName = path.basename(file);

    //log.debug(`${_logKey}${func} - in:`, file);

    const p = dbWrapper.loadDir(dirName).then((dirItem) => {

      if (dirItem) {
        mediaComposer.rateDirByShownFile(dirItem, fileName);
        return dbWrapper.saveDir(dirItem);
      }

      log.info(`${_logKey}${func}.promise - cannot find parent for item (${file})!`);
      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  updateDirFiles(payload) {
    // AR_WORKER_UPDATE_DIRFILES - createActionUpdateDirFiles - only updates or add files - no remove!
    const func = '.updateDirFiles';

    const { folder, fileNames } = payload;

    if (!folder || !fileNames) {
      log.error(`${_logKey}${func} - invalid payload: `, payload);
      return Promise.resolve();
    }

    const instance = this;
    const { data } = instance;
    const { dbWrapper } = instance.objects;
    const { mediaComposer } = instance.objects;
    const { metaReader } = instance.objects;

    let dirItem = null;

    const p = dbWrapper.loadDir(folder).then((dirItemDb) => {

      dirItem = dirItemDb;
      if (!dirItem)
        dirItem = mediaComposer.createDirItem(folder);

      if (fileNames.length === 0 || instance.data.processingStopped)
        return Promise.resolve([]);

      let p2 = Promise.resolve();
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

        /* eslint-disable no-loop-func */
        const p3 = metaReader.loadMeta(filePath).then((meta) => {
          if (meta)
            mediaComposer.updateFileMeta(dirItem, meta);
          return Promise.resolve();
        });
        /* eslint-enable no-loop-func */
        p2 = p2.then(() => { return p3; });

      }

      return p2;

    }).then(() => {

      mediaComposer.evaluateDir(dirItem);

      return dbWrapper.saveDir(dirItem);

    }).then(() => {

      if (data.scanActiveSendFirstAvailableFiles)
        return instance.chooseAndSendFiles();

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  static shouldSeasonBeRecaluclated(weightingSeason, dirItem) {
    if (weightingSeason > 1) {
      const seasonShift = constants.DEFCONF_CRAWLER_TODAY_SHIFT_SEASON * 24 * 60 * 60 * 1000;
      const minUpdateTime = new Date().getTime() - seasonShift;
      return (dirItem.lastUpdate < minUpdateTime)
    } else
      return false;
  }

  // .......................................................

  checkAndHandleChangedFileItems(dirItem, fileNamesFs, configChanged = false) {
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

    setFs.forEach((fileName) => {
      const fileItem =  this.objects.mediaComposer.createFileItem({fileName});
      fileItemsNew.push(fileItem);
      itemUpdate.push(fileItem.fileName);
      doFileItemsSave = true;
    });

    // updating seasonWeight - file has to be reloaded because lastUpdate must be set!
    if (!doFileItemsSave && MediaCrawler.shouldSeasonBeRecaluclated(crawlerState.weightingSeason, dirItem)) {
      log.debug(`${_logKey}${func} - force reloading (season): ${dirItem.dir}`);
      doFileItemsSave = true;
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
            const action = workerActions.createActionUpdateDirFiles(dirItem.dir, actionItems);
            // => AR_WORKER_UPDATE_DIRFILES => updateDirFiles(payload)
            this.objects.storeManager.dispatchTask(action);
            actionItems = [];
          }
        }
      }
    }
    else {
      // recalculate items without loading from disc
      if (configChanged) {
        log.debug(`${_logKey}${func} - force evaluation (configChanged): ${dirItem.dir}`);
        this.objects.mediaComposer.evaluate(dirItem);
        doFileItemsSave = true;
      }
    }

    return doFileItemsSave;
  }

  // .......................................................

  updateDir(payload) {
    // AR_WORKER_UPDATE_DIR
    const func = '.updateDir';

    const { dir, configChanged } = payload;

    //log.debug(`${_logKey}${func} - in: ${folder}`);

    if (!dir)
      return Promise.resolve();

    const instance = this;
    const { dbWrapper } = instance.objects;
    const { mediaComposer } = instance.objects;
    const { storeManager } = instance.objects;
    const crawlerState = storeManager.crawlerState;

    if (!fileUtils.isDirectory(dir)) {
      log.info(`${_logKey}${func} - no dir: ${dir}`);
      return Promise.resolve();
    }
    const isFolderBlacklisted = MediaFilter.isFolderBlacklisted(
      dir,
      crawlerState.folderBlacklist,
      crawlerState.blacklistFolderSnippets
    );
    if (isFolderBlacklisted) {
      log.info(`${_logKey}${func} - blacklisted: ${dir}`);
      return Promise.resolve();
    }

    const children = MediaFilter.listMediaFilesShort(dir);

    const p = dbWrapper.loadDir(dir).then((dirItem) => {

      if (!dirItem)
        dirItem = mediaComposer.createDirItem({dir});

      //log.debug(`${_logKey}${func} - dirItem:`, dirItem);

      if (instance.checkAndHandleChangedFileItems(dirItem, children, configChanged))
        return dbWrapper.saveDir(dirItem);

      return Promise.resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  checkCrawlerFinally() {
    // AR_WORKER_CRAWLER_FINALLY
    const func = '.checkCrawlerFinally';

    if (this.data.scanActiveSendFirstAvailableFiles) {
      const crawlerState = this.objects.storeManager.crawlerState;

      log.error(`${_logKey}${func} - missing reset "scanActiveSendFirstAvailableFiles" => no media found in sourceFolders:`, crawlerState.sourceFolders);
      this.objects.storeManager.showMessage(constants.MSG_TYPE_ERROR, 'Auto-selection failed! No media files found in choosen source folder(s). Please choose an existing or higher-level folder. The crawler drills down autonomously and will find your media files.');
      this.data.scanActiveSendFirstAvailableFiles = false;
    }

    return Promise.resolve();
  }
}

// ----------------------------------------------------------------------------------
