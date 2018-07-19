import path from 'path';
import {DbWrapper} from '../../../app/worker/crawler/dbWrapper';
import {MediaCrawler} from '../../../app/worker/crawler/mediaCrawler';
import {TestManager} from "../../common/store/testManager";
import * as testUtils from '../../common/utils/testUtils';
import * as stringUtils from "../../../app/common/utils/stringUtils";

// ----------------------------------------------------------------------------------

let _testDirDb = null;
let _testDirMedia = null;

// ----------------------------------------------------------------------------------

describe('mediaCrawler', () => {

  beforeAll(() => {

    _testDirDb = testUtils.ensureEmptyTestDir('mediaCrawlerDb');
    _testDirMedia = testUtils.ensureEmptyTestDir('mediaCrawlerMedia');

  });

  afterAll(() => {
  });

  it('complexTest', () => {

    const storeManager = new TestManager();
    const state = storeManager.crawlerState;

    state.databasePath = _testDirDb;

    const dbWrapper = new DbWrapper();
    const mediaCrawler = new MediaCrawler();

    const objects = {dbWrapper, mediaCrawler};
    dbWrapper.coupleObjects(objects);
    mediaCrawler.coupleObjects(objects);

    // return dbWrapper.open().then(() => {
    //
    //
    // });

    // return mediaCrawler.dummyErrorTest().then(() => {
    //   console.log('mediaCrawler.dummyErrorTest - then:');
    // }).catch((err) => {
    //   console.log('mediaCrawler.dummyErrorTest - catch:', err);
    //
    // });



  });


});
