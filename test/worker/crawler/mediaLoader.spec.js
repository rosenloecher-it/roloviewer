import fs from 'fs-extra';
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {DummyTestSystem} from "./dummyTestSystem";
import * as testUtils from "../../common/utils/testUtils";
import path from "path";
import * as constants from "../../../app/common/constants";

// ----------------------------------------------------------------------------------

const _logKey = 'test-mediaLoader';

const _testBaseNameDb = 'mediaLoaderDb';
const _testBaseNameMedia = 'mediaLoaderMedia';
let _testDirDb = null;
let _testDirMedia = null;

const _useNewTestDirEveryTime = false;

// ----------------------------------------------------------------------------------

function createTestSystemWithMediaDir(countDirs = 0, countFiles = 0) {
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

  // ........................................................

  it('openDroppedSync', () => {

    const countFilesPerDir = 2;
    const countSubDirs = 2;
    const countFiles = (countSubDirs + 1) * countFilesPerDir;

    const testSystem = createTestSystemWithMediaDir();

    const dirs = [ _testDirMedia ];

    for (let i = 0; i < countSubDirs; i++)
      dirs.push(path.join(_testDirMedia, `${stringUtils.randomString(8)}_${i}`));

    const args = { files: [] };

    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      fs.mkdirsSync(dir);

      if (i > 0)
        args.files.push(dir);

      for (let k = 0; k < countFilesPerDir; k++) {
        const filename = `testdummy_${(i * countFilesPerDir) + k + 1}.${DummyTestSystem.getRandomImageExt()}`;
        const fullPath = testSystem.saveTestFile(dir, filename, 0);
        if (i === 0)
          args.files.push(fullPath);
      }
    }

    expect(testSystem.files.length).toBe(countFiles);

    const p = testSystem.init().then(() => {

      testSystem.mediaLoader.openDroppedSync(args);

      const globalActions = testSystem.storeManager.data.globalDispatchedActions;

      //console.log('globalActions', globalActions);

      expect(globalActions.length).toBe(countFiles + 1);
      const actionShow = testSystem.storeManager.getLastGlobalAction(constants.AR_RENDERER_SHOW_CONTAINER_FILES);

      console.log('actionShow', actionShow);

      for (let i = 0; i < testSystem.files.length; i++) {
        const testFile = testSystem.files[i];

        let checkCounter = 0;

        for (let k = 0; k < actionShow.payload.items.length; k++) {
          const actionItem = actionShow.payload.items[k];
          //console.log('actionItem', actionItem);
          if (actionItem.file === testFile)
            checkCounter++;
        }
        expect(checkCounter).toBe(1);
      }

      return Promise.resolve();
    }).then(() => {

      return testSystem.shutdown();
    });

  });



});
