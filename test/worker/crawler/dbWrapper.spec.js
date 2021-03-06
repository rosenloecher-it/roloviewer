import deepEquals from 'deep-equal';
import * as constants from '../../../app/common/constants';
import {DbWrapper} from '../../../app/worker/crawler/dbWrapper';
import {MediaComposer} from '../../../app/worker/crawler/mediaComposer';
import {TestManager} from "../../common/store/testManager";
import * as testUtils from '../../common/utils/testUtils';
import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";
import * as stringUtils from "../../../app/common/utils/stringUtils";

// ----------------------------------------------------------------------------------

let _testDir = null;

// ----------------------------------------------------------------------------------

function createTestDirItem(mediaComposer, countFiles) {

  const dirName = stringUtils.randomString(12);
  const dir = mediaComposer.createDirItem({dir: dirName});

  for (let i = 0; i < countFiles; i++) {
    const fileName = stringUtils.randomString(12);
    const item = mediaComposer.createFileItem({
      fileName,
      weight: i, // => re-sort necessary, no extra evaluateFileItem necessary
      rating: Math.floor(5 * Math.random()),
      time: Math.floor(Date.now() * Math.random()),
      lastShown: Math.floor(Date.now() * Math.random()),
    });

    dir.fileItems.push(item);
  }

  mediaComposer.evaluateDir(dir);

  return dir;
}

// ----------------------------------------------------------------------------------

describe('dbWrapper', () => {

  beforeEach(() => {

    _testDir = testUtils.ensureEmptyTestDir('dbwrapper');

  });

  // .......................................................

  it('load/save state', () => {

    const storeManager = new TestManager();
    //const crawlerReducer = new CrawlerReducer('test');

    const stateIn = storeManager.crawlerState;
    stateIn.databasePath = _testDir;

    // dummy data
    stateIn.blacklistFolders.push('blacklistFolders1');
    stateIn.blacklistFolders.push('blacklistFolders2');
    stateIn.blacklistFolderSnippets.push('blacklistFolderSnippets1');
    stateIn.blacklistFolderSnippets.push('blacklistFolderSnippets2');
    stateIn.showRatings.push(1);
    stateIn.showRatings.push(2);
    stateIn.blacklistTags.push('blacklistTag1');
    stateIn.blacklistTags.push('blacklistTag2');

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager});

    return dbWrapper.init().then(() => {
      return dbWrapper.countStates();

    }).then((count) => {
      expect(count).toBe(0);

      return dbWrapper.saveState(stateIn);

    }).then(() => {
      return dbWrapper.loadState();

    }).then((stateOut) => {

      const compare = CrawlerReducer.compareCrawleStates(stateIn, stateOut);
      expect(compare).toBe(true);

      return dbWrapper.countStates();

    }).then((count) => {
      expect(count).toBe(1);

      return dbWrapper.clearDb();

    }).then(() => {

      return dbWrapper.countStates();

    }).then((count) => {
      expect(count).toBe(0);

      return dbWrapper.shutdown();
    });

  });

  // .......................................................

  it('save/count dirs', () => {

    const countDefault = 10;
    const countAll = countDefault + 1; // maxWeight
    const lastUpdatedInMinutes = 30;
    const pathDocToBeUpdated = `${stringUtils.randomString(10)}_maxWeight`;

    const storeManager = new TestManager();
    const mediaComposer = new MediaComposer();
    //const crawlerReducer = new CrawlerReducer('test');

    const stateIn = storeManager.crawlerState;
    stateIn.databasePath = _testDir;

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager});

    return dbWrapper.init().then(() => {
      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(0);

      const promises = [];

      for (let i = 0; i < countDefault; i++) {

        const pathIn = `${stringUtils.randomString(10)}_${i}`;
        const docIn = mediaComposer.createDirItem({dir: pathIn });
        docIn.weight = 1000 * Math.random();
        docIn.lastUpdate = Date.now();
        docIn.lastShown = Date.now();

        promises.push(dbWrapper.saveDir(docIn));
        // push the same dir 2x and check that no doubles exist
        promises.push(dbWrapper.saveDir(docIn));
      }

      const pathMaxWeight = pathDocToBeUpdated;
      const docMaxWeight = mediaComposer.createDirItem({dir: pathMaxWeight});
      docMaxWeight.weight = constants.CRAWLER_MAX_WEIGHT;
      docMaxWeight.lastUpdate = Date.now() - 2 * lastUpdatedInMinutes * 60;

      promises.push(dbWrapper.saveDir(docMaxWeight));
      promises.push(dbWrapper.saveDir(docMaxWeight)); // 2. to test unique

      return Promise.all(promises);
    }).then(() => {
      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(countAll);

      return dbWrapper.listDirsAll();
    }).then((dirs) => {

      let foundNonEmpty = 0;
      for (let i = 0; i < dirs.length ; i++) {
        if (dirs[i].dir && dirs[i]._id)
          foundNonEmpty++;
      }
      expect(foundNonEmpty).toBe(countAll);

      return dbWrapper.listDirsWeigthSorted();

    }).then((dirs) => {

      let foundNonEmpty = 0;
      let lastValue = null;
      for (let i = 0; i < dirs.length ; i++) {
        const dir = dirs[i];

        if (i === 0)
          lastValue = dir.weight;
        else
          expect(dir.weight).not.toBeLessThan(lastValue);

        if (dirs[i].dir && dirs[i]._id)
          foundNonEmpty++;
      }
      expect(foundNonEmpty).toBe(countDefault); // weight less than constants.CRAWLER_MAX_WEIGHT (pathMw)

      return dbWrapper.listDirsToUpdate(lastUpdatedInMinutes);

    }).then((dirs) => {
      expect(dirs.length).toBe(1);

      expect(dirs[0].dir).toBe(pathDocToBeUpdated);

      return dbWrapper.countDirsShowable();

    }).then((countDirsShowable) => {

      expect(countDirsShowable).toBe(countDefault);

      return dbWrapper.clearDb();

    }).then(() => {

      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(0);

      return dbWrapper.shutdown();
    });


  });

  // .......................................................

  it('load/save dirs', () => {

    const storeManager = new TestManager();
    const mediaComposer = new MediaComposer();
    mediaComposer.coupleObjects({storeManager});
    //const crawlerReducer = new CrawlerReducer('test');

    const stateIn = storeManager.crawlerState;
    stateIn.databasePath = _testDir;

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager, mediaComposer});

    mediaComposer.createDirItem({dir: 'ss'});

    const docsIn = [];
    for (let i = 0; i < 3; i++) {
      const countFiles = 9 * Math.random();
      const dirItem = createTestDirItem(mediaComposer, countFiles);
      dirItem.equalChecked = false;
      docsIn.push(dirItem);
    }

    return dbWrapper.init().then(() => {

      const promises = [];
      for (let i = 0; i < docsIn.length; i++) {
        const docIn = docsIn[i];
        promises.push(dbWrapper.saveDir(docIn));
      }
      return Promise.all(promises);

    }).then(() => {
      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(docsIn.length);

      const promises = [];
      for (let i = 0; i < docsIn.length; i++) {
        const docIn = docsIn[i];
        promises.push(dbWrapper.loadDir(docIn.dir));
      }
      return Promise.all(promises);

    }).then((promiseAllArgs) => {

      let countEqual = 0;
      for (let i = 0; i < promiseAllArgs.length; i++) {
        const docOut = promiseAllArgs[i];

        for (let k = 0; k < docsIn.length; k++) {
          const docIn = docsIn[k];
          if (!docIn.equalChecked) {
            if (docIn.dir === docOut.dir) {
              if (deepEquals(docIn, docOut))
                countEqual++;
              docIn.equalChecked = true;
              break;
            }
          }
        }
      }
      expect(countEqual).toBe(docsIn.length);

      return Promise.resolve();

    }).then(() => {

      const promises = [];
      for (let i = 0; i < docsIn.length; i++) {
        const docIn = docsIn[i];
        promises.push(dbWrapper.removeDir(docIn.dir));
      }
      return Promise.all(promises);

    }).then(() => {

      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(0);

      return dbWrapper.loadDir('does_not_exists'); // test loading non existing

    }).then((doc) => {

      expect(doc).toBe(null); // test loading non existing

      return dbWrapper.shutdown();
    });


  });

});
