import path from 'path';
import fs from 'fs';
import * as constants from '../../../app/common/constants';
import {DbWrapper} from '../../../app/worker/crawler/dbWrapper';
import {MediaCrawler} from '../../../app/worker/crawler/mediaCrawler';
import {TestManager} from "../../common/store/testManager";
import * as testUtils from '../../common/utils/testUtils';
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {DummyTestSystem} from "./dummyTestSystem";
import {MediaComposer} from "../../../app/worker/crawler/mediaComposer";
import {Dispatcher} from "../../../app/worker/crawler/dispatcher";
import {MetaReader} from "../../../app/worker/crawler/metaReader";
import {MediaLoader} from "../../../app/worker/crawler/mediaLoader";
import {Factory} from "../../../app/worker/crawler/factory";
import storeManager from "../../../app/main/store/mainManager";
import * as actionsCrawlerTasks from "../../../app/common/store/crawlerTasksActions";


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

  beforeEach(() => {

    _testDirDb = testUtils.ensureEmptyTestDir('mediaCrawlerDb');
    _testDirMedia = testUtils.ensureEmptyTestDir('mediaCrawlerMedia');

  });

  // ........................................................


  it('initCrawler', () => {

    let count = null;

    const testSystem = createTestSystemWithMediaDir(); //empty

    testSystem.createTestDir(_testDirMedia, 'dir1');
    testSystem.saveTestFile(_testDirMedia, 'file1.jpg');

    const p = testSystem.init().then(() => {

      const action = actionsCrawlerTasks.createActionInitCrawler();
      return testSystem.dispatcher.dispatchTask(action);
      //return testSystem.mediaCrawler.initCrawler();

    }).then(() => {

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

      console.log('dirItems', dirItems);

      count = dirItems.length;
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

  it('sdvcfsdavfcdsa', () => {

    let count = null;
  });

  // ........................................................
});
