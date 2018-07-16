import path from 'path';
import sleep from 'thread-sleep';
import {DbWrapper} from '../../../app/worker/crawler/dbWrapper';
import {TestManager} from "../../common/store/testManager";
import * as testUtils from '../../common/utils/testUtils';
//import {sync} from '../../common/utils/promiseUtils';

// ----------------------------------------------------------------------------------

const subdir = 'dbwrapper';

let _testDir = null;

// ----------------------------------------------------------------------------------

describe('dbWrapper', () => {

  beforeAll(() => {

    _testDir = testUtils.ensureEmptyTestDir(subdir);

  });

  afterAll(() => {
    //return initializeCityDatabase();
  });

  it('open', () => {

    const storeManager = new TestManager();
    const state = storeManager.crawlerState;

    state.databasePath = _testDir;
    console.log('', state)

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager});

    const idIn = 'Abc123';
    const idOut = dbWrapper.convert2Id(idIn);
    if (process.platform === 'linux')
      expect(idOut).toBe(idIn);

    const pathIn = '/Abc123';
    const weigthTest = 9;


    return dbWrapper.open().then(() => {
      const docIn = dbWrapper.createDirDoc({dir: pathIn});
      docIn.weight = weigthTest;

      console.log('docIn=', docIn);
      return dbWrapper.saveDoc(docIn);
    }).then(() => {

      console.log('doc saved.');
      return dbWrapper.loadDoc(pathIn);

    }).then((docOut) => {

      console.log('docOut=', docOut);

      expect(docOut.weight).toBe(weigthTest);

      return true;
    }).catch((err) => {
      console.error('test failed:', err);
    });











  });

});
