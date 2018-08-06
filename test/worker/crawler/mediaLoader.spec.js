import fs from 'fs-extra';
import path from "path";
import * as constants from "../../../app/common/constants";
import * as stringUtils from "../../../app/common/utils/stringUtils";
import * as testUtils from "../../common/utils/testUtils";
import * as fileUtils from "../../../app/common/utils/fileUtils";
import {DummyTestSystem} from "./dummyTestSystem";
import {MediaLoader} from "../../../app/worker/crawler/mediaLoader";
import { isWinOs } from "../../../app/common/utils/systemUtils";


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

    return p;

  });

  // ........................................................

  it('convertPlaylistLine2File', () => {

    const isWin = isWinOs();
    let dirPlaylist;
    let out;

    if (!isWin) {
      // check linux
      dirPlaylist = '/home/user/images';

      out = MediaLoader.convertPlaylistLine2File(null, dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('', dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('   ', dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('; ./hgfhg/add.jpg', dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('# /hgfhg/add.jpg', dirPlaylist, isWin);
      expect(out).toBe(null);

      out = MediaLoader.convertPlaylistLine2File('/home/user/123/add.jpg', dirPlaylist, isWin);
      expect(out).toBe('/home/user/123/add.jpg');
      out = MediaLoader.convertPlaylistLine2File('./123/add.jpg', dirPlaylist, isWin);
      expect(out).toBe('/home/user/images/123/add.jpg');
      out = MediaLoader.convertPlaylistLine2File('.\\123\\add.jpg', dirPlaylist, isWin); // relative windows pathes
      expect(out).toBe('/home/user/images/123/add.jpg');
      out = MediaLoader.convertPlaylistLine2File('../add.jpg', dirPlaylist, isWin);
      expect(out).toBe('/home/user/add.jpg');

    } else {
      // check windows
      dirPlaylist = 'd:\\home\\user\\images';

      out = MediaLoader.convertPlaylistLine2File(null, dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('', dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('   ', dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('; .\\hgfhg\\add.jpg', dirPlaylist, isWin);
      expect(out).toBe(null);
      out = MediaLoader.convertPlaylistLine2File('# \\hgfhg\\add.jpg', dirPlaylist, isWin);
      expect(out).toBe(null);

      out = MediaLoader.convertPlaylistLine2File('d:\\home\\user\\123\\add.jpg', dirPlaylist, isWin);
      expect(out).toBe('d:\\home\\user\\123\\add.jpg');
      out = MediaLoader.convertPlaylistLine2File('.\\123\\add.jpg', dirPlaylist, isWin);
      expect(out).toBe('d:\\home\\user\\images\\123\\add.jpg');
      out = MediaLoader.convertPlaylistLine2File('./123/add.jpg', dirPlaylist, isWin); // relative linux pathes
      expect(out).toBe('d:\\home\\user\\images\\123\\add.jpg');
      out = MediaLoader.convertPlaylistLine2File('..\\add.jpg', dirPlaylist, isWin);
      expect(out).toBe('d:\\home\\user\\add.jpg');
    }

  });

  // ........................................................

  it('openPlayListSync', () => {

    const filelist = [];

    function createPlaylistFile(subdir1, subdir2, filename) {
      let dirRel = '.';
      let dirAbs = _testDirMedia;
      if (subdir1) {
        dirAbs = path.join(dirAbs, subdir1);
        dirRel += path.sep + subdir1;
      }
      if (subdir2) {
        dirAbs = path.join(dirAbs, subdir2);
        dirRel += path.sep + subdir2;
      }
      fs.mkdirsSync(dirAbs);

      const fullPath = testSystem.saveTestFile(dirAbs, filename, 0);
      expect(fileUtils.isFile(fullPath)).toBe(true);

      filelist.push({
        fullPath,
        dirRel,
        dirAbs,
        filename,
      });
    }

    function writePlaylist(absolute, file) {
      expect(fileUtils.isFile(file)).toBe(false);
      let text = '# comment1\n; comment2\r\n';
      for (let i = 0; i < filelist.length; i++) {
        const item = filelist[i];
        let line = null;
        if (absolute)
          line = path.join(item.dirAbs, item.filename);
        else
          line = item.dirRel + path.sep + item.filename;

        if (i % 2 === 1)
          line += '\r\n';
        else
          line += '\n';

        text += line;
      }
      fs.writeFileSync(file, text, 'utf8');
      expect(fileUtils.isFile(file)).toBe(true);
    }

    function checkFiles(actionShow) {
      for (let i = 0; i < filelist.length; i++) {
        const testFile = filelist[i].fullPath;
        let checkCounter = 0;

        for (let k = 0; k < actionShow.payload.items.length; k++) {
          const actionItem = actionShow.payload.items[k];
          //console.log('actionItem', actionItem);
          if (actionItem.file === testFile)
            checkCounter++;
        }
        expect(checkCounter).toBe(1);
      }
    }
    const testSystem = createTestSystemWithMediaDir();

    createPlaylistFile(null, null, 'file1.jpg');
    createPlaylistFile('dir1', null, 'file2.jpg');
    createPlaylistFile('dir2', 'dir21', 'file3.jpg');
    createPlaylistFile('dir2', 'dir22', 'file4.jpg');

    const playlistAbs = path.join(_testDirMedia, 'abs.txt');
    const playlistRel = path.join(_testDirMedia, 'rel.txt');
    writePlaylist(true, playlistAbs);
    writePlaylist(false, playlistRel);

    const p = testSystem.init().then(() => {

      testSystem.storeManager.clearGlobalActions();
      expect(testSystem.storeManager.data.globalDispatchedActions.length).toBe(0);

      testSystem.mediaLoader.openPlaylistSync({container:playlistAbs });

      const globalActions = testSystem.storeManager.data.globalDispatchedActions;
      //console.log('globalActions', globalActions);
      expect(globalActions.length).toBe(filelist.length + 1);
      const actionShow = testSystem.storeManager.getLastGlobalAction(constants.AR_RENDERER_SHOW_CONTAINER_FILES);

      //console.log('actionShow', actionShow);
      console.log('actionShow.payload.items)', actionShow.payload.items);

      checkFiles(actionShow);

      return Promise.resolve();

    }).then(() => {

      testSystem.storeManager.clearGlobalActions();
      expect(testSystem.storeManager.data.globalDispatchedActions.length).toBe(0);

      testSystem.mediaLoader.openPlaylistSync({container:playlistRel });

      const globalActions = testSystem.storeManager.data.globalDispatchedActions;
      //console.log('globalActions', globalActions);
      expect(globalActions.length).toBe(filelist.length + 1);
      const actionShow = testSystem.storeManager.getLastGlobalAction(constants.AR_RENDERER_SHOW_CONTAINER_FILES);

      //console.log('actionShow', actionShow);
      console.log('actionShow.payload.items)', actionShow.payload.items);

      checkFiles(actionShow);

      return Promise.resolve();

    }).then(() => {

      return testSystem.shutdown();

    });

    return p;

  });

  // ........................................................

  it('sortFilename', () => {

    const files = [];
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1136-1403.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1526-6008.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1439-5954.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1221-5951.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1718-6015.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1623-5973.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1440-5955.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1527-1405.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1722-6017.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1748-5986.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1712-5975.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1743-5981.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1747-5982.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1756-6020.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1810-5998.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1803-5991.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151028-1035-1412.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1647-6012.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1836-6000.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1810-5999.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151029-1655-6035.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1724-6019.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151026-1807-6025.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151027-1617-1411.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151028-1329-6033.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151030-1813-6039.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151030-1818-6050.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151030-1947-6052.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151031-1038-6057.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151031-1503-1439.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1803-5989.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1809-5995.jpg');
    files.push('/home/data/mymedia/201x/2015/20151025 Lara/20151025-1808-5992.jpg');

    files.sort((file1, file2) => {
      return MediaLoader.sortFilename(file1, file2);
    });

    console.log('files', files);

    let fileLast;
    for (let i = 0; i < files.length; i++) {
      const file = files[i].toLowerCase();
      if (i > 0) {
        if (file <= fileLast) {
          console.log(`${i}: file=${file} || last=${fileLast}`);
          expect('compare failed!').toBeGreaterThan('ok');
        }
      }
      fileLast = file.toLowerCase();
    }
  });

  // ........................................................

  // it('openFolder', () => {
  //
  //   const countFilesPerDir = 2;
  //   const countSubDirs = 2;
  //   const countFiles = (countSubDirs + 1) * countFilesPerDir;
  //
  //   const testSystem = createTestSystemWithMediaDir();
  //
  //   const args = {
  //     container: '/home/data/mymedia/201x/2015/20151025 Lara',
  //     selectFile: null,
  //   };
  //
  //   const p = testSystem.init().then(() => {
  //
  //     testSystem.mediaLoader.openFolderSync(args);
  //
  //     const globalActions = testSystem.storeManager.data.globalDispatchedActions;
  //     //console.log('globalActions', globalActions);
  //
  //     const actionShow = globalActions[0];
  //     console.log('actionShow.payload.items', actionShow.payload.items);
  //     return Promise.resolve();
  //   }).then(() => {
  //
  //     return testSystem.shutdown();
  //   });
  //
  // });


});
