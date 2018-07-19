import path from 'path';
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

describe('mediaCrawler', () => {

  beforeAll(() => {

    _testDirDb = testUtils.ensureEmptyTestDir('mediaCrawlerDb');
    _testDirMedia = testUtils.ensureEmptyTestDir('mediaCrawlerMedia');

  });

  afterAll(() => {

  });

  // ........................................................

  it('complexTest', () => {

    const testSystem = createDummyDir(2, 2);

    const {mediaCrawler} = testSystem;

    const p = testSystem.init().then(() => {

      return mediaCrawler.updateDir(_testDirMedia);

    }).then(() => {

      console.log('testSystem', testSystem.storeManager.data.dispatchedActions)

      return testSystem.shutdown();
    });

    return p;
  });


});
