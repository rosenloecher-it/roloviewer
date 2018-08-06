import path from "path";
import * as constants from '../../../app/common/constants';
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {DummyTestSystem} from "./dummyTestSystem";
import * as workerActions from "../../../app/common/store/workerActions";
import * as testUtils from "../../common/utils/testUtils";
// ----------------------------------------------------------------------------------

const _logKey = 'test-dispatcher';

const _testBaseNameDb = 'dispatcherDb';
const _testBaseNameMedia = 'dispatcherMedia';
let _testDirDb = null;
let _testDirMedia = null;

const _useNewTestDirEveryTime = true;

// ----------------------------------------------------------------------------------

function createTestSystemWithMediaDir(countDirs = 0, countFiles = 0) {
  const testSystem = new DummyTestSystem();

  const state = testSystem.crawlerState;
  state.databasePath = _testDirDb;
  state.batchCount = 3;
  state.sourceFolders.push(_testDirMedia);

  testSystem.createSingleDir(_testDirMedia, countDirs, countFiles);

  return testSystem;
}

// ----------------------------------------------------------------------------------

describe(_logKey, () => {

  beforeAll(() => {

    if (_useNewTestDirEveryTime) {
      testUtils.ensureEmptyTestDir(_testBaseNameDb);
      testUtils.ensureEmptyTestDir(_testBaseNameMedia);
    }

    return Promise.resolve();
  });

  // ........................................................

  beforeEach(() => {

    if (_useNewTestDirEveryTime) {
      const subdir = stringUtils.randomString(8);
      _testDirDb = testUtils.ensureEmptyTestDir(path.join(_testBaseNameDb, subdir));
      _testDirMedia = testUtils.ensureEmptyTestDir(path.join(_testBaseNameMedia, subdir));
    } else {
      _testDirDb = testUtils.ensureEmptyTestDir(_testBaseNameDb);
      _testDirMedia = testUtils.ensureEmptyTestDir(_testBaseNameMedia);
    }

    return Promise.resolve();

  });

  // .......................................................

  it('onTimerStatusDb', () => {

    let count = null;

    const testSystem = createTestSystemWithMediaDir();

    const fileName1 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName2 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;
    const fileName3 = `${stringUtils.randomString(8)}.${DummyTestSystem.getRandomImageExt()}`;

    testSystem.saveTestFile(_testDirMedia, fileName1, 0);
    testSystem.saveTestFile(_testDirMedia, fileName2, 0);
    testSystem.saveTestFile(_testDirMedia, fileName3, 0);

    const p = testSystem.init().then(() => {

      const action = workerActions.createActionUpdateDir(_testDirMedia);
      return testSystem.dispatcher.dispatchTask(action);
      //return mediaCrawler.updateDir(_testDirMedia);

    }).then(() => {

      const tasks = testSystem.storeManager.tasks;
      const task = tasks[0];
      expect(task.type).toBe(constants.AR_WORKER_UPDATE_DIRFILES);

      testSystem.storeManager.clearTasks();
      return testSystem.dispatcher.dispatchTask(task); // AR_WORKER_UPDATE_DIRFILES

    }).then(() => {

      count = testSystem.storeManager.countTasks();
      expect(count).toBe(0);

      return testSystem.dbWrapper.loadDir(_testDirMedia);

    }).then((/* dirItem */) => {

      testSystem.storeManager.clearGlobalActions();

      testSystem.dispatcher.data.statusExistDataDb = true;
      return testSystem.dispatcher.onTimerStatusDb();

    }).then(() => {

      const globalActions = testSystem.storeManager.data.globalDispatchedActions;
      //console.log('globalActions', globalActions);

      expect(globalActions.length).toBe(1);
      const action = globalActions[0];
      expect(action.type).toBe(constants.AR_STATUS_DB);

      expect(action.payload.countDbDirs).toBe(1);
      expect(action.payload.countDbFiles).toBe(3);

      return Promise.resolve();

    }).then(() => {

      return testSystem.shutdown();
    });

    return p;
  });

  // ........................................................


});
