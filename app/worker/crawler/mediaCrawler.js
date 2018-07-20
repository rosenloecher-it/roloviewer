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

      stateComposed.restartCrawle = false;

      if (!MediaCrawler.compareStatus(crawlerStateCurrent, stateComposed.lastConfig)) {
        log.info(`${_logKey}${func} - config changed => restart crawle`);
        stateComposed.restartCrawle = true;
      }
      return Promise.resolve();
    });

    return p;
  }

  // ........................................................

  collectAllFoldersRecursive(dirSet, currentDir, folderBlacklist, folderBlacklistSnippets) {
    const func = '.addFoldersRecursive';

    if (!currentDir)
      return;
    if (MediaFilter.shouldSkipFolder(currentDir, folderBlacklist, folderBlacklistSnippet))
      return;

    const children = fs.readdirSync(currentDir);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      const fileLong = path.join(folder, fileShort);
      if (fs.lstatSync(fileLong).isDirectory()) {
        if (MediaFilter.shouldSkipFolder(fileLong, folderBlacklist, folderBlacklistSnippet))
          log.info(`${_logKey}${func} - skipped: ${fileLong}`);
        else {
          dirSet.add(fileLong);
          addFoldersRecursive(dirSet, fileLong, folderBlacklist, folderBlacklistSnippets);
        }
      }
    }
  }

  // ........................................................

  collectAllFolders() {

    const dirSet = new Set();

    const {storeManager} = this.objects;
    const crawlerState = storeManager.crawlerState;

    for (let i = 0; i < crawlerState.folderSource.length; i++) {
      addFoldersRecursive(dirSet, crawlerState.folderSource[i],
        crawlerState.folderBlacklist, crawlerState.folderBlacklistSnippets);
    }

    return dirSet;
  }

  // ........................................................

  handleNonExistenceDirs(dirItems, dirSet) {

    if (!dirItems || !dirSet)
      return;

    const {storeManager} = this.object;

    for (let i = 0; i < dirItems.length; i++) {
      const dirItem = dirItems[i];
      if (!dirSet.has(dirItem.dir)) {
        const action = actionsCrawlerTasks.createActionRemoveDir(dirItem.dir);
        storeManager.dispatchTask(action);
      }
    }
  }

  // ........................................................

  handleNewDirs(dirItems, dirSet) {

    if (!dirItems || !dirSet)
      return;

    const {storeManager} = this.object;


    const dirsFs = dirSet.toArray();

    for (let i = 0; i < dirItems.length; i++) {
      const dirItem = dirItems[i];
      if (!dirSet.has(dirItem.dir)) {
        const action = actionsCrawlerTasks.createActionRemoveDir(dirItem.dir);
        storeManager.dispatchTask(action);
      }
    }
  }

  // ........................................................

  startCrawler(doFullScan) {
    const func = '.startCrawler';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.object;

    const p = dbWrapper.listDirsAll().then((dirItems) => {

      const dirsFsSet = instance.collectFoldersInSet();

      instance.handleNonExistenceDirs(dirItems, dirsFsSet);

      let dirs2update = null;
      if (doFullScan) {
        dirs2update = dirSet.toArray();

        // reset old tasks
        const action1 = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_FILES);
        storeManager.dispatchTask(action1);

        const action2 = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_UPDATE_DIR);
        storeManager.dispatchTask(action2);

      } else
        dirs2update = instance.handleNewDirs(dirItems, dirsFs);

      if (dirs2update) {
        for (let i = 0; i < dirs2update.length; i++) {
          const action = actionsCrawlerTasks.createActionUpdateDir(dirs2update[i]);
          storeManager.dispatchTask(action);
        }
      }

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

  }

  // ........................................................

  initCrawler() {
    // AR_WORKER_INIT_CRAWLE
    const func = '.initCrawler';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerStateCurrent = storeManager.crawlerState;

    const p = this.loadState().then((stateComposed) => {

      if (stateComposed.restartCrawle === false) {
        const {lastUpdateDirs} = stateComposed;
        for (let i = 0; i < lastUpdateDirs.length; i++) {
          const action = actionsCrawlerTasks.createActionUpdateDir(lastUpdateDirs[i]);
          storeManager.dispatchTask(action);
        }
      }

      return instance.startCrawler(stateComposed.restartCrawle);

    }).then(() => {

      return instance.startCrawler(restartCrawle);

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;


  }

  // .......................................................

  removeDir(file) {
    // AR_WORKER_REMOVE_DIR
    const func = '.removeNonExistingDirs';

    const {dbWrapper} = this.objects;

    const p = dbWrapper.removeDir(file).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
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

  updateFiles(folder, fileNames) {
    // AR_WORKER_UPDATE_FILES - only updates or add files - no remove!
    const func = '.updateFiles';

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

      return dbWrapper.saveDoc(dirItem);

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

    let p = null;

    if (children.length === 0)
      p = dbWrapper.removeDir(folder);
    else {
      p = dbWrapper.loadDir(folder).then((dirItem) => {

        if (!dirItem)
          dirItem = mediaComposer.createDirItem({dir: folder});

        log.debug(`${_logKey}${func} - dirItem:`, dirItem);
        log.debug(`${_logKey}${func} - children:`, children);

        if (instance.checkAndHandleChangedFileItems(dirItem, children))
          return dbWrapper.saveDir(dirItem);

        return Promise.resolve();

      });
    }

    return p.catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });
  }

}

// ----------------------------------------------------------------------------------

