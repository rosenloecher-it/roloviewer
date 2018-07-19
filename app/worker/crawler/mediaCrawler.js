import log from 'electron-log';
import deepEquals from 'deep-equal';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import {CrawlerBase} from "./CrawlerBase";
import * as actionsSlideshow from "../../common/store/slideshowActions";
import {MediaDisposer} from "./mediaDisposer";

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
    const {mediaDisposer} = instance.objects;
    const {storeManager} = instance.objects;
    const crawlerState = storeManager.crawlerState;


    const p = dbWrapper.listDirsWeigthSorted().then((files) => {

      if (0 === files.length)
        throw new Error('auto-selection failed (no dirs delivered)!');

      const selected = mediaDisposer.randomWeighted(files.length);

      const selectedFile = files[selected];

      return dbWrapper.loadDoc(selectedFile);
    }).then((dir) => {

      const files = mediaDisposer.randomSelectFilesFromDir(dir, crawlerState.batchCount);
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

    const action1 = actionsCrawlerTasks.createActionRemoveTaskTypes(constants.AR_WORKER_FILES_META);
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
    const {mediaDisposer} = instance.objects;

    const p = dbWrapper.loadDoc(file).then((dir) => {

      mediaDisposer.evaluateFile(file);
      mediaDisposer.evaluateDir(dir);

      return dbWrapper.saveDoc(dir);

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  updateFilesMeta(folder) {
    // AR_WORKER_FILES_META
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

  updateDir(folder) {
    // AR_WORKER_DIR_RATE
    const func = '.updateDir';

    // TODO implement updateDir

    // load data from db
    // load fileItems from fs

    // put subdirs as new AR_WORKER_DIR_UPDATE

    // compare: put batchs (10x) of changed fileItems into new task AR_WORKER_FILES_META
    // ??? mark dir

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

}

// ----------------------------------------------------------------------------------

// Markierungen Dir
//   status: default, skip-new, skip-proposal-but-not-shown
//   lastPlayed
//   lastProposal

// Markierungen File
//   status: default, skip-filter
//   lastPlayed
//   lastChanged



//  Auswahl Verzeichnis
//  Berechnung EVAL
//
//  	Datum: fixes Datum oder Installation DB <== day0
//  	kleinerer Wert gewinnt
//  	Konfig: Interpretation 0 Sterne als x (2) Sterne!
//
//  	Items:
//  		eval_time = mt * (last_played - day0)
//  			kleinerer Wert gewinnt
//
//  		eval_rating = -(m)r * rating
//  			negativ: kleinerer Wert gewinnt
//
//  		gesamt = mt * (last_played - day0) - mr * rating
//
//  		mt == 1 /(fix)
//
//  		mr == 60 (x1 Stern gleich 60 Tage aus)
//
//  		Markierung "skip" !
//
//  	Verzeichnis
//  		Anforderung
//  			items werden sortiert gespeichert!
//
//  		eval_time = mt * (last_played - day0)
//  			kleinerer Wert gewinnt
//
//  		avg-item = Durchschnitt der 10 kleinsten Item-Werte
//
//  		gesamt = mt * (last_played - day0) - ma * avg-item - mc * count
//
//  			mt == 1 (fix?)
//  			ma == 60 (wie Items?)
//  			mc == 1 / batch_count
//
//  		- Wert für Items

// dirs werden gesperrt => rating auf MAX
//   wenn im Cache
//   wenn vorgemerkt  für Update

// ----------------------------------------------------------------------------------



