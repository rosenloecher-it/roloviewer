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


// ----------------------------------------------------------------------------------

const _logKey = 'mediaCrawler';

let _testDirDb = null;
let _testDirMedia = null;

// ----------------------------------------------------------------------------------

function createDummyTestSystem(width, depth) {
  const testSystem = new DummyTestSystem();


  const state = testSystem.crawlerState;
  state.databasePath = _testDirDb;
  state.batchCount = 3;
  state.folderSource.push(_testDirMedia);

  testSystem.createFileSystemStructure(_testDirMedia, width, depth, state.batchCount * 3);

  return testSystem;
}

// ----------------------------------------------------------------------------------

function createDummyDir(countDirs, countFiles) {
  const testSystem = new DummyTestSystem();

  const state = testSystem.crawlerState;
  state.databasePath = _testDirDb;
  state.batchCount = 3;
  state.folderSource.push(_testDirMedia);

  testSystem.createSingleDir(_testDirMedia, countDirs, countFiles);

  return testSystem;
}

// ----------------------------------------------------------------------------------

describe(_logKey, () => {

  beforeAll(() => {

    _testDirDb = testUtils.ensureEmptyTestDir('mediaCrawlerDb');
    _testDirMedia = testUtils.ensureEmptyTestDir('mediaCrawlerMedia');

  });

  afterAll(() => {

  });

  // ........................................................

  it('checkAndHandleChangedFileItems', () => {
    const func = '.checkAndHandleChangedFileItems';

    let count = 0 ;

    const testSystem = createDummyDir(2, 2);

    const dirItem = testSystem.mediaComposer.createDirItem({dir: 'abc'});
    //const fileItems = ['file1', 'file2'];
    const fileItems = ['dsvfsd', 'jhgjfh'];

    const p = testSystem.init().then(() => {
      testSystem.mediaCrawler.checkAndHandleChangedFileItems(dirItem, fileItems);

    }).then(() => {

      count = testSystem.storeManager.data.dispatchedActions.length;
      expect(count).toBe(1);

      const task = testSystem.storeManager.data.dispatchedActions[0];
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


  it('updateDir', () => {
    const func = '.updateDir';

    let count = null;

    const testSystem = createDummyDir(2, 2);

    const {mediaCrawler} = testSystem;

    const p = testSystem.init().then(() => {

      return mediaCrawler.updateDir(_testDirMedia);

    }).then(() => {

      count = testSystem.storeManager.data.dispatchedActions.length;
      expect(count).toBe(1);

      const task = testSystem.storeManager.data.dispatchedActions[0];
      expect(task.type).toBe(constants.AR_WORKER_UPDATE_FILES);

      for (let i = 0; i < task.payload.fileNames.length; i++) {
        const fullPath = path.join(task.payload.folder, task.payload.fileNames[i]);
        const isFile = fs.lstatSync(fullPath).isFile();
        expect(isFile).toBe(true);
      }

      console.log(`${_logKey}${func} - task:`, task);
      //
      // expect(count).toBe(1);
      //
      // testSystem.dispatcher.dispatchTask(task);

      return Promise.resolve();

      // testSystem.dispatcher.dispatchLocal()
      //
      // testSystem.storeManager.clearActions();
      // //console.log('testSystem', testSystem.storeManager.data.dispatchedActions)
      //
      // return mediaCrawler.updateDir(_testDirMedia);

    }).then(() => {

      // count = testSystem.storeManager.data.dispatchedActions.length;
      // expect(count).toBe(0);


      return testSystem.shutdown();
    });

    return p;
  });


});
