import deepEquals from 'deep-equal';
import * as constants from '../../../app/common/constants';
import {DbWrapper} from '../../../app/worker/crawler/dbWrapper';
import {MediaDisposer} from '../../../app/worker/crawler/mediaDisposer';
import {TestManager} from "../../common/store/testManager";
import * as testUtils from '../../common/utils/testUtils';
import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";
import * as stringUtils from "../../../app/common/utils/stringUtils";

// ----------------------------------------------------------------------------------

let _testDir = null;

// ----------------------------------------------------------------------------------

function createTestDirItem(mediaDisposer, countFiles) {

  const dirName = stringUtils.randomString(12);
  const dir = mediaDisposer.createDirItem({dir: dirName});

  for (let i = 0; i < countFiles; i++) {
    const fileName = stringUtils.randomString(12);
    const item = mediaDisposer.createFileItem({
      fileName,
      weight: i, // => re-sort necessary, no extra evaluateFile necessary
    });

    dir.fileItems.push(item);
  }

  mediaDisposer.evaluateDir(dir);

  return dir;
}

// ----------------------------------------------------------------------------------

describe('dbWrapper', () => {

  beforeEach(() => {

    _testDir = testUtils.ensureEmptyTestDir('dbwrapper');

  });

  // .......................................................

  it('load/save status', () => {

    const storeManager = new TestManager();
    //const crawlerReducer = new CrawlerReducer('test');

    const stateIn = storeManager.crawlerState;
    stateIn.databasePath = _testDir;

    // dummy data
    stateIn.folderBlacklist.push('folderBlacklist1');
    stateIn.folderBlacklist.push('folderBlacklist2');
    stateIn.folderBlacklistSnippets.push('folderBlacklistSnippets1');
    stateIn.folderBlacklistSnippets.push('folderBlacklistSnippets2');
    stateIn.showRating.push(1);
    stateIn.showRating.push(2);
    stateIn.tagBlacklist.push('tagBlacklist1');
    stateIn.tagBlacklist.push('tagBlacklist2');

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager});

    return dbWrapper.init().then(() => {
      return dbWrapper.countStates();

    }).then((count) => {
      expect(count).toBe(0);

    }).then(() => {
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

    }).then(() => {
      return dbWrapper.shutdown();
    });

  });

  // .......................................................

  it('save/count dirs', () => {

    const countInsert = 10;
    const lastUpdatedInMinutes = 30;
    const pathDocToBeUpdated = `${stringUtils.randomString(10)}_maxWeight`;

    const storeManager = new TestManager();
    const mediaDisposer = new MediaDisposer();
    //const crawlerReducer = new CrawlerReducer('test');

    const stateIn = storeManager.crawlerState;
    stateIn.databasePath = _testDir;

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager});

    return dbWrapper.init().then(() => {
      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(0);

    }).then(() => {

      const promises = [];

      for (let i = 0; i < countInsert; i++) {

        const pathIn = `${stringUtils.randomString(10)}_${i}`;
        const docIn = mediaDisposer.createDirItem({dir: pathIn });
        docIn.weight = Math.random();
        docIn.lastUpdate = Date.now();

        promises.push(dbWrapper.saveDir(docIn));
      }

      const pathMw = pathDocToBeUpdated;
      const docMw = mediaDisposer.createDirItem({dir: pathMw});
      docMw.weight = constants.CRAWLER_MAX_WEIGHT;
      docMw.lastUpdate = Date.now() - 2 * lastUpdatedInMinutes * 60;

      promises.push(dbWrapper.saveDir(docMw));

      return Promise.all(promises);
    }).then(() => {
      return dbWrapper.countDirs();

    }).then((count) => {
      expect(count).toBe(countInsert + 1);

      return dbWrapper.listDirsAll();
    }).then((dirs) => {

      let foundNonEmpty = 0;
      for (let i = 0; i < dirs.length ; i++) {
        if (dirs[i].dir && dirs[i]._id)
          foundNonEmpty++;
      }
      expect(foundNonEmpty).toBe(countInsert + 1);

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
      expect(foundNonEmpty).toBe(countInsert + 1);

      return dbWrapper.listDirsToUpdate(lastUpdatedInMinutes);

    }).then((dirs) => {
      expect(dirs.length).toBe(1);

      expect(dirs[0].dir).toBe(pathDocToBeUpdated);

      return dbWrapper.clearDb();

    }).then(() => {

      return dbWrapper.countStates();

    }).then((count) => {
      expect(count).toBe(0);

    }).then(() => {
      return dbWrapper.shutdown();
    });


  });

  // .......................................................

  it('load/save dirs', () => {

    const storeManager = new TestManager();
    const mediaDisposer = new MediaDisposer();
    //const crawlerReducer = new CrawlerReducer('test');

    const stateIn = storeManager.crawlerState;
    stateIn.databasePath = _testDir;

    const dbWrapper = new DbWrapper();
    dbWrapper.coupleObjects({storeManager, mediaDisposer});

    mediaDisposer.createDirItem({dir: 'ss'});

    const docsIn = [];
    for (let i = 0; i < 3; i++) {
      const countFiles = 9 * Math.random();
      const dirItem = createTestDirItem(mediaDisposer, countFiles);
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

    }).then(() => {
      return dbWrapper.shutdown();
    });


  });

});
