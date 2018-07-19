import deepEquals from 'deep-equal';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import set from 'collections/set';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import {CrawlerBase} from "./CrawlerBase";
import * as actionsSlideshow from "../../common/store/slideshowActions";
import {MediaComposer} from "./mediaComposer";
import {MediaLoader} from "./mediaLoader";

// ----------------------------------------------------------------------------------

const _logKey = "mediaCrawler";

// ----------------------------------------------------------------------------------

export class MediaCrawler extends CrawlerBase {

  constructor() {
    super();

    if (process.platform.toLowerCase().indexOf('win') >= 0)
      this.isFolderBlackListed = this.isFolderBlackListedWindows;
    else
      this.isFolderBlackListed = this.isFolderBlackListedStandard;



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

      const files = mediaComposer.randomSelectFilesFromDir(dir, crawlerState.batchCount);
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

  isFolderBlackListedWindows(file, folderBlacklist, folderBlacklistSnippets) {
    if (!file)
      return true;

    const fileLowerCase = file.toLowerCase();

    for (let i = 0; i < folderBlacklist.length; i++) {
      if (file.indexOf(folderBlacklist[i].toLowerCase()) === 0)
        return true;
    }

    for (let i = 0; i < folderBlacklistSnippets.length; i++) {
      if (fileLowerCase.indexOf(folderBlacklistSnippets[i].toLowerCase()) >= 0)
        return true;
    }

    return false;
  }

  isFolderBlackListedStandard(file, folderBlacklist, folderBlacklistSnippets) {
    if (!file)
      return true;

    for (let i = 0; i < folderBlacklist.length; i++) {
      if (file.indexOf(folderBlacklist[i]) === 0)
        return true;
    }

    const fileLowerCase = file.toLowerCase();
    for (let i = 0; i < folderBlacklistSnippets.length; i++) {
      if (fileLowerCase.indexOf(folderBlacklistSnippets[i].toLowerCase()) >= 0)
        return true;
    }

    return false;
  }

  // ........................................................

  addFolderToTaskList(file) {
    const func = `.addFolderToTaskList`;

    const {storeManager} = this.objects;
    const crawlerState = storeManager.crawlerState;

    if (!file)
      return;

    if (this.isFolderBlackListed(file, crawlerState.folderBlacklist, crawlerState.folderBlacklistSnippets)) {
      log.debug(`${_logKey}${func} - blacklisted: ${file}`);
      return;
    }

    const action = actionsCrawlerTasks.createActionDirUpdate(file);
    storeManager.dispatchTask(action);

    // folderBlacklist: [],
    //   folderBlacklistSnippets: [],
    //   folderSource: [],
  }
  // ........................................................

  restartCrawler() {

    const {storeManager} = this.objects;
    const crawlerState = storeManager.crawlerState;

    const action1 = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_FILES_UPDATE);
    storeManager.dispatchTask(action1);

    const action2 = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_DIR_UPDATE);
    storeManager.dispatchTask(action2);

    for (let i = 0; i < crawlerState.folderSource.length; i++)
      this.addFolderToTaskList(crawlerState.folderSource[i]);

  }

  // ........................................................

  updateStatus() {
    // AR_WORKER_STATUS_UPDATE
    const func = '.updateStatus';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerStateCurrent = storeManager.crawlerState;

    // check count dirs < 0 => restart
    const p = dbWrapper.countDirs().then((countDirs) => {
      if (!countDirs) {
        log.info(`${_logKey}${func} - not dirs (${countDirs}) found => restart crawle`);
        this.restartCrawler();
        return Promise.resolve();
      }

      // check current setting with saved settings, when changed => restart
      return dbWrapper.loadState();
    }).then((crawlerStateSaved) => {

      if (!MediaCrawler.compareStatus(crawlerStateCurrent, crawlerStateSaved)) {
        log.info(`${_logKey}${func} - config changed => restart crawle`);
        this.restartCrawler();

        return Promise.resolve();
      }

      const action = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_DIRS_REMOVE_NON_EXISTING);
      storeManager.dispatchTask(action);

      const updateDirsAfterMinutes = constants.DEFCONF_CRAWLER_UPDATE_DIR_AFTER_MINUTES;
      return dbWrapper.listDirsToUpdate(updateDirsAfterMinutes);
    }).then() ((files) => {

      for (let i = 0; i < files.length; i++)
        this.addFolderToTaskList(files[i]);
      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  removeNonExistingDirs() {
    // AR_WORKER_DIRS_REMOVE_NON_EXISTING
    const func = '.removeNonExistingDirs';

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {storeManager} = instance.objects;

    const p = dbWrapper.listDirsAll().then((files) => {

      for (let i = 0; i < files.length; i++) {
        const action1 = actionsCrawlerTasks.createActionDirRemoveNonExisting(files[i]);
        storeManager.dispatchTask(action1);
      }

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  removeNonExistingDir(file) {
    // AR_WORKER_DIRS_REMOVE_NON_EXISTING
    const func = '.removeNonExistingDirs';

    const {dbWrapper} = this.objects;

    const p = dbWrapper.removeDir(file).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  rateDirFromPlayedFile(file) {
    // AR_WORKER_DIR_RATE
    const func = '.rateDirFromPlayedFile';

    const instance = this;
    const {dbWrapper} = this.objects;
    const {mediaComposer} = instance.objects;

    const p = dbWrapper.loadDoc(file).then((dir) => {

      mediaComposer.evaluateFile(file);
      mediaComposer.evaluateDir(dir);

      return dbWrapper.saveDoc(dir);

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  updateFilesMeta(folder) {
    // AR_WORKER_FILES_UPDATE
    const func = '.updateFilesMeta';

    // TODO implement updateFilesMeta

    // args: list of fileItems
    // load dir from db
    // update meta for listed fileItems
    // sort fileItems + rate dir
    // save dir to db

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // .......................................................

  listChildren(folder) {
    const func = '.listChildren';

    const fileNames = [];
    const dirs = [];

    const children = fs.readdirSync(folder);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      const fileLong = path.join(folder, fileShort);
      if (fs.lstatSync(fileLong).isDirectory()) {
        if (this.skipSourceFolder(fileLong))
          log.info(`${_logKey}${func} - skipped: ${fileLong}`);
        else
          dirs.push(fileLong);
      } else {
        if (MediaLoader.isImageFormatSupported(fileShort))
          fileNames.push(fileShort);
      }
    }

    return { fileNames, dirs };
  }

  // .......................................................

  compareFileItems(dirItem, fileNamesFs) {

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
        const lastChange = fs.lstatSync(filePath).mtimeMs;
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

    for (const fileNameNew of setFs) {
      const fileItem =  this.objects.mediaComposer.createFileItem(fileNameNew);
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
            const action = actionsCrawlerTasks.createActionFilesUpdate(dirItem.dir, actionItems);
            this.objects.storeManager.dispatchTask(action);
            actionItems = [];
          }
        }
      }
    }

    return doFileItemsSave;
  }

  // .......................................................

  skipSourceFolder(folder) {

    const crawlerState = this.objects.storeManager.crawlerState;

    return MediaLoader.shouldSkipSourceFolder(folder, crawlerState.folderBlacklist, crawlerState.folderBlacklistSnippets);

      //if (MediaLoader.shouldSkipSourceFolder(folder, crawlerState.blacklistFolders, crawlerState.blacklistSnippets))
  }


  // .......................................................

  updateDir(folder) {
    // AR_WORKER_DIR_RATE
    const func = '.updateDir';

    if (!folder)
      return Promise.resolve();

    const instance = this;
    const {dbWrapper} = instance.objects;
    const {mediaComposer} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;

    if (this.skipSourceFolder(folder)) {
      log.info(`${_logKey}${func} - skipped: ${folder}`);
      return Promise.resolve();
    }

    const children = this.listChildren(folder);

    for (let k = 0; k < children.dirs.length; k++) {
      const action = actionsCrawlerTasks.createActionDirUpdate(children.dirs[k]);
      storeManager.dispatchTask(action);
    }

    const p = dbWrapper.loadDir(folder).then((dirItem) => {

      if (!dirItem)
        dirItem = mediaComposer.createDirItem({dir: folder});

      if (instance.compareFileItems(dirItem, children.fileNames))
        return dbWrapper.saveDir(dirItem);

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

}

// ----------------------------------------------------------------------------------

