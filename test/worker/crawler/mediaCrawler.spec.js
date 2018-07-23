import path from 'path';
import deepmerge from 'deepmerge';
import fs from 'fs';
import * as constants from '../../../app/common/constants';
import * as testUtils from '../../common/utils/testUtils';
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {DummyTestSystem} from "./dummyTestSystem";
import * as actionsCrawlerTasks from "../../../app/common/store/crawlerTasksActions";
import {CrawlerTasksReducer} from "../../../app/common/store/crawlerTasksReducer";
import {MediaCrawler} from "../../../app/worker/crawler/mediaCrawler";
import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";


// ----------------------------------------------------------------------------------

const _logKey = 'test-mediaCrawler';

let _testDirDb = null;
let _testDirMedia = null;

// ----------------------------------------------------------------------------------

function createTestSystemWithMediaDir() {
  const testSystem = new DummyTestSystem();

  const state = testSystem.crawlerState;
  state.databasePath = _testDirDb;
  state.batchCount = 3;
  state.folderSource.push(_testDirMedia);

  testSystem.createSingleDir(_testDirMedia, 0, 0);

  return testSystem;
}

// ----------------------------------------------------------------------------------

function dispatchAll(testSystem) {

  const tasks = testSystem.storeManager.tasks;

  const promises = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    promises.push(testSystem.dispatcher.dispatchTask(task));
  }

  return Promise.all(promises);
}

// ----------------------------------------------------------------------------------

describe(_logKey, () => {

  beforeAll(() => {

    // const subdir = stringUtils.randomString(8);
    // _testDirDb = testUtils.ensureEmptyTestDir(path.join(subdir,'mediaCrawlerDb'));
    // _testDirMedia = testUtils.ensureEmptyTestDir(path.join(subdir,'mediaCrawlerMedia'));

    _testDirDb = testUtils.ensureEmptyTestDir('mediaCrawlerDb');
    _testDirMedia = testUtils.ensureEmptyTestDir('mediaCrawlerMedia');

    return true;

  });

  // ........................................................

  beforeEach(() => {

    const subdir = stringUtils.randomString(8);
    _testDirDb = testUtils.ensureEmptyTestDir(path.join('mediaCrawlerDb', subdir));
    _testDirMedia = testUtils.ensureEmptyTestDir(path.join('mediaCrawlerMedia', subdir));

    // _testDirDb = testUtils.ensureEmptyTestDir('mediaCrawlerDb');
    // _testDirMedia = testUtils.ensureEmptyTestDir('mediaCrawlerMedia');

    return true;

  });

  // ........................................................

  it('initCrawler', () => {

    const testSystem = createTestSystemWithMediaDir(); //empty

    testSystem.createTestDir(_testDirMedia, 'dir1');
    testSystem.saveTestFile(_testDirMedia, 'file1.jpg');

    const crawlerState = testSystem.storeManager.crawlerState;
    const crawlerTasksState = testSystem.storeManager.crawlerTasksState;

    const p = testSystem.init().then(() => {

      const action = actionsCrawlerTasks.createActionInitCrawler();
      return testSystem.dispatcher.dispatchTask(action);
      //return testSystem.mediaCrawler.initCrawler();

    }).then(() => {

      let count = null;

      //tasks = testSystem.storeManager.tasks;
      //console.log('tasks', tasks);

      count = testSystem.storeManager.countTasks();
      expect(count).toBe(3);
      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_REMOVE_DIRS);
      expect(count).toBe(1);
      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_SCAN_FSDIR);
      expect(count).toBe(1);
      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_RELOAD_DIRS);
      expect(count).toBe(1);

      return dispatchAll(testSystem);

    }).then(() => {

      return testSystem.dbWrapper.listDirsAll();

    }).then((dirItems) => {

      //console.log('dirItems', dirItems);
      const count = dirItems.length;
      expect(count).toBe(0);

    }).then(() => {

      return testSystem.shutdown();
    });

    return p;
  });

  // ........................................................

  it('checkAndHandleChangedFileItems', () => {
    const func = '.checkAndHandleChangedFileItems';

    let count = 0 ;

    const testSystem = createTestSystemWithMediaDir();

    const dirName1 = `${stringUtils.randomString(8)}`;
    const fileName1 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName2 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;

    testSystem.createTestDir(_testDirMedia, dirName1);
    testSystem.saveTestFile(_testDirMedia, fileName1, 1);
    testSystem.saveTestFile(_testDirMedia, fileName2, 2);

    const dirItem = testSystem.mediaComposer.createDirItem({dir: _testDirMedia});
    const fileItems = [fileName1, fileName2];

    const p = testSystem.init().then(() => {
      testSystem.mediaCrawler.checkAndHandleChangedFileItems(dirItem, fileItems);

    }).then(() => {

      const tasks = testSystem.storeManager.tasks;
      count = tasks.length;
      expect(count).toBe(1)

      const task = tasks[0];
      expect(task.type).toBe(constants.AR_WORKER_UPDATE_FILES);
      expect(!!task.payload.folder).toBe(true);

      console.log(`${_logKey}${func} - task:`, task);

      for (let i = 0; i < task.payload.fileNames.length; i++) {
        console.log(`${_logKey}${func} - task.payload.fileNames[${i}]:`, task.payload.fileNames[i]);
        expect(!!task.payload.fileNames[i]).toBe(true);
      }

      return testSystem.shutdown();
    });

    return p;

  });

  // ........................................................

  it('complex: updateDir + updateFiles', () => {

    let count = null;

    const testSystem = createTestSystemWithMediaDir();

    const dirName1 = `${stringUtils.randomString(8)}`;
    const fileName1 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName2 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;

    const rating1 = 1;
    const rating2 = 2;

    testSystem.createTestDir(_testDirMedia, dirName1);
    testSystem.saveTestFile(_testDirMedia, fileName1, rating1);
    testSystem.saveTestFile(_testDirMedia, fileName2, rating2);

    // test test
    expect(DummyTestSystem.readTestFile(_testDirMedia, fileName1).rating).toBe(1);
    expect(DummyTestSystem.readTestFile(_testDirMedia, fileName2).rating).toBe(2);

    const p = testSystem.init().then(() => {

      const action = actionsCrawlerTasks.createActionUpdateDir(_testDirMedia);
      return testSystem.dispatcher.dispatchTask(action);
      //return mediaCrawler.updateDir(_testDirMedia);

    }).then(() => {

      const tasks = testSystem.storeManager.tasks;
      count = tasks.length;
      expect(count).toBe(tasks.length);

      const task = tasks[0];
      expect(task.type).toBe(constants.AR_WORKER_UPDATE_FILES);

      for (let i = 0; i < task.payload.fileNames.length; i++) {
        const fullPath = path.join(task.payload.folder, task.payload.fileNames[i]);
        const isFile = fs.lstatSync(fullPath).isFile();
        expect(isFile).toBe(true);
      }

      testSystem.storeManager.clearTasks();
      return testSystem.dispatcher.dispatchTask(task); // AR_WORKER_UPDATE_FILES

    }).then(() => {

      count = testSystem.storeManager.countTasks();
      expect(count).toBe(0);

      return testSystem.dbWrapper.loadDir(_testDirMedia)

    }).then((dirItem) => {

      console.log('dirItem', dirItem);

      expect(dirItem).not.toBeNull();

      expect(dirItem.fileItems.length).toBe(2);
      expect(dirItem.fileItems[0].fileName).toBe(fileName2); // sorted rating
      expect(dirItem.fileItems[0].rating).toBe(2);

      expect(dirItem.fileItems[1].fileName).toBe(fileName1); // sorted rating
      expect(dirItem.fileItems[1].rating).toBe(1);

      for (let i = 0; i < dirItem.fileItems.length; i++) {
        const filePath = path.join(dirItem.dir, dirItem.fileItems[i].fileName);
        const isFile = fs.lstatSync(filePath).isFile();
        expect(isFile).toBe(true);
      }

      return testSystem.dbWrapper.listDirsAll();

    }).then((dirItems) => {

      //console.log('dirItems', dirItems);

      count = dirItems.length;
      expect(count).toBe(1);

      return testSystem.shutdown();
    });

    return p;
  });

  // ........................................................

  it('complex: saveState + loadState', () => {

    const testSystem = createTestSystemWithMediaDir(); //empty

    const crawlerState = testSystem.crawlerState;
    const crawlerTasksState = testSystem.crawlerTasksState;

    crawlerState.tagBlacklist.push('tag1');

    const p = testSystem.init().then(() => {

      const action = actionsCrawlerTasks.createActionUpdateDir(_testDirMedia);
      testSystem.storeManager.dispatchTask(action);

      const count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR);
      expect(count).toBe(1);

      return testSystem.mediaCrawler.saveState();

    }).then(() => {

      testSystem.storeManager.clearTasks();
      expect(testSystem.storeManager.countTasks()).toBe(0);
      expect(testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR)).toBe(0);

      return testSystem.mediaCrawler.loadState();

    }).then((stateComposed) => {

      expect(testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR)).toBe(1);
      expect(stateComposed.rescanAll).toBe(false);


      // change setting to see a 'rescanAll === true'
      crawlerState.tagBlacklist.push('tag2');
      return testSystem.mediaCrawler.loadState();

    }).then((stateComposed) => {

      // old task have to get deleted before filling the new ones (from db)
      expect(testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR)).toBe(1);
      expect(stateComposed.rescanAll).toBe(true);

    }).then(() => {

      return testSystem.shutdown();
    });

    return p;

  });

  // ........................................................

  it('complex: reloadDirs', () => {

    let count  = null;

    const testSystem = createTestSystemWithMediaDir(); //empty
    const {dbWrapper, mediaComposer, storeManager} = testSystem;
    const crawlerState = storeManager.crawlerState;

    const countAll = 6;
    const countOld = 3;
    const countNew = countAll - countOld;
    const dateOld = Date.now() - 2 * crawlerState.updateDirsAfterMinutes * 60 * 60 ;
    const dateNew = Date.now();

    console.log(`dateOld=${dateOld}, dateNew=${dateNew}`);

    const p = testSystem.init().then(() => {
      const promises = [];
      for (let i = 0; i < countAll; i++) {
        const dirItem = mediaComposer.createDirItem({dir: `${stringUtils.randomString(10)}_${i}` });
        if (i < countOld)
          dirItem.lastUpdate = dateOld;
        else
          dirItem.lastUpdate = dateNew;
        promises.push(dbWrapper.saveDir(dirItem));
      }
      return Promise.all(promises);

    }).then(() => {

      return testSystem.dbWrapper.listDirsAll();

    }).then((dirItems) => {

      //console.log('dirItems', dirItems);
      count = dirItems.length;
      expect(count).toBe(countAll);

      count = testSystem.storeManager.countTasks();
      expect(count).toBe(0);

      return testSystem.mediaCrawler.reloadDirs({rescanAll: false});

    }).then(() => {

      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR);
      expect(count).toBe(countOld);


      return testSystem.mediaCrawler.reloadDirs({rescanAll: true});

    }).then(() => {

      // remove old entry and add all
      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR);
      expect(count).toBe(countAll);


      return testSystem.shutdown();
    });

    return p;

  });

  // ........................................................

  it('complex: scanFsDir', () => {

    let count  = null;

    const testSystem = createTestSystemWithMediaDir(); //empty
    const {dbWrapper, mediaComposer, storeManager} = testSystem;
    const crawlerState = storeManager.crawlerState;

    const countAll = 6;
    const countOld = 3;
    const dateOld = Date.now() - 2 * crawlerState.updateDirsAfterMinutes * 60 * 60 ;
    const dateNew = Date.now();

    console.log(`dateOld=${dateOld}, dateNew=${dateNew}`);

    const p = testSystem.init().then(() => {
      const promises = [];
      for (let i = 0; i < countAll; i++) {
        const dirItem = mediaComposer.createDirItem({dir: `${stringUtils.randomString(10)}_${i}` });
        if (i < countOld)
          dirItem.lastUpdate = dateOld;
        else
          dirItem.lastUpdate = dateNew;
        promises.push(dbWrapper.saveDir(dirItem));
      }
      return Promise.all(promises);

    }).then(() => {

      return testSystem.dbWrapper.listDirsAll();

    }).then((dirItems) => {

      //console.log('dirItems', dirItems);
      count = dirItems.length;
      expect(count).toBe(countAll);

      count = testSystem.storeManager.countTasks();
      expect(count).toBe(0);

      return testSystem.mediaCrawler.reloadDirs({rescanAll: false});

    }).then(() => {

      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR);
      expect(count).toBe(countOld);


      return testSystem.mediaCrawler.reloadDirs({rescanAll: true});

    }).then(() => {

      // remove old entry and add all
      count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_UPDATE_DIR);
      expect(count).toBe(countAll);


      return testSystem.shutdown();
    });

    return p;

  });

  // ........................................................

  it('equalsStateNoRescan', () => {

    let state1, state2, compare;

    state1 = CrawlerReducer.defaultState();
    state2 = deepmerge.all([ state1, {} ]);


    compare = MediaCrawler.equalsStateNoRescan(state1, state2);
    expect(compare).toBe(true);

    state2.batchCount = 2 * state1.batchCount;
    compare = MediaCrawler.equalsStateNoRescan(state1, state2);
    expect(compare).toBe(true);

    state2 = deepmerge.all([ state1, {} ]);
    state2.showRating.push(3);
    compare = MediaCrawler.equalsStateNoRescan(state1, state2);
    expect(compare).toBe(false);

    state2 = deepmerge.all([ state1, {} ]);
    state2.tagBlacklist.push('tag2');
    compare = MediaCrawler.equalsStateNoRescan(state1, state2);
    expect(compare).toBe(false);

    state2 = deepmerge.all([ state1, {} ]);
    state2.folderSource.push('source2');
    compare = MediaCrawler.equalsStateNoRescan(state1, state2);
    expect(compare).toBe(false);
  });

  // ........................................................

  it('scanFsDir', () => {
    // scanFsDir(dir)
    const testSystem = createTestSystemWithMediaDir();

    const dirPath1 = path.join(_testDirMedia, stringUtils.randomString(8));
    const dirPath2 = path.join(_testDirMedia, stringUtils.randomString(8));
    const fileName1 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName2 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;

    testSystem.createTestDir(dirPath1);
    testSystem.createTestDir(dirPath2);
    testSystem.saveTestFile(_testDirMedia, fileName1, 1);
    testSystem.saveTestFile(_testDirMedia, fileName2, 2);

    const p = testSystem.init().then(() => {

      const action = actionsCrawlerTasks.createActionInitCrawler();
      return testSystem.dispatcher.dispatchTask(action);
      //return testSystem.mediaCrawler.initCrawler();

    }).then(() => {

      //tasks = testSystem.storeManager.tasks;
      //console.log('tasks', tasks);

      testSystem.storeManager.clearTasks(constants.AR_WORKER_REMOVE_DIRS);
      testSystem.storeManager.clearTasks(constants.AR_WORKER_RELOAD_DIRS);

      const count = testSystem.storeManager.countTypeTasks(constants.AR_WORKER_SCAN_FSDIR);
      expect(count).toBe(1);
      const tasks = testSystem.storeManager.tasks;
      expect(tasks.length).toBe(1);

      testSystem.storeManager.clearTasks();

      const action = tasks[0];
      return testSystem.dispatcher.dispatchTask(action);

    }).then(() => {

      const tasks = testSystem.storeManager.tasks;

      let countActionScanFsDir = 0;
      let countActionUpdateDir = 0;
      let countDir1 = 0;
      let countDir2 = 0;

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (task.type === constants.AR_WORKER_SCAN_FSDIR) countActionScanFsDir++;
        if (task.type === constants.AR_WORKER_UPDATE_DIR) countActionUpdateDir++;
        if (task.payload === dirPath1) countDir1++;
        if (task.payload === dirPath2) countDir2++;
      }

      //console.log('tasks', tasks);

      expect(countActionScanFsDir).toBe(2);
      expect(countActionUpdateDir).toBe(2);
      expect(countDir1).toBe(2);
      expect(countDir2).toBe(2);

      return testSystem.dbWrapper.listDirsAll();

    }).then((dirItems) => {

      //console.log('dirItems', dirItems);
      const count = dirItems.length;
      expect(count).toBe(0);

    }).then(() => {

      return testSystem.shutdown();
    });

  });

  // ........................................................

  it('rateDirByFile', () => {

    // rateDirByFile({file})

    let count = null;

    const testSystem = createTestSystemWithMediaDir();

    const fileName1 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName2 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName3 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;

    testSystem.saveTestFile(_testDirMedia, fileName1, 0);
    testSystem.saveTestFile(_testDirMedia, fileName2, 0);
    testSystem.saveTestFile(_testDirMedia, fileName3, 0);

    const filePath1 = path.join(_testDirMedia, fileName1);

    let dirWeight1 = 0;

    const p = testSystem.init().then(() => {

      const action = actionsCrawlerTasks.createActionUpdateDir(_testDirMedia);
      return testSystem.dispatcher.dispatchTask(action);
      //return mediaCrawler.updateDir(_testDirMedia);

    }).then(() => {

      const tasks = testSystem.storeManager.tasks;
      const task = tasks[0];
      expect(task.type).toBe(constants.AR_WORKER_UPDATE_FILES);

      testSystem.storeManager.clearTasks();
      return testSystem.dispatcher.dispatchTask(task); // AR_WORKER_UPDATE_FILES

    }).then(() => {

      count = testSystem.storeManager.countTasks();
      expect(count).toBe(0);

      return testSystem.dbWrapper.loadDir(_testDirMedia)

    }).then((dirItem) => {

      dirWeight1 = dirItem.weight;
      expect(dirWeight1).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

      // const action = actionsCrawlerTasks.createActionRateDirByFile(filePath1);
      // return testSystem.dispatcher.dispatchTask(action);
      return testSystem.mediaCrawler.rateDirByFile(filePath1);

    }).then(() => {
      return testSystem.dbWrapper.loadDir(_testDirMedia)

    }).then((dirItem) => {

      const dirWeight2 = dirItem.weight;
      expect(dirWeight2).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);
      expect(dirWeight1).toBeLessThan(dirWeight2);

      return testSystem.shutdown();
    });

    return p;
  });

  // ........................................................
});
