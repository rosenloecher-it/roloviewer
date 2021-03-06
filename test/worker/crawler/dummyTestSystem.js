import path from 'path';
import fs from 'fs-extra';
import * as fileUtils from '../../../app/common/utils/fileUtils';
import * as stringUtils from '../../../app/common/utils/stringUtils';
import { DbWrapper } from '../../../app/worker/crawler/dbWrapper';
import { Dispatcher } from '../../../app/worker/crawler/dispatcher';
import { DummyMetaReader } from './dummyMetaReader';
import { Factory } from '../../../app/worker/crawler/factory';
import { MediaComposer } from '../../../app/worker/crawler/mediaComposer';
import { MediaCrawler } from '../../../app/worker/crawler/mediaCrawler';
import { MediaLoader } from '../../../app/worker/crawler/mediaLoader';
import { TestManager } from '../../common/store/testManager';

// ----------------------------------------------------------------------------------

const _logKey = 'dummyTestSystem'; // eslint-disable-line no-unused-vars

// ----------------------------------------------------------------------------------

export class DummyTestSystem {
  constructor() {
    this.dirs = [];
    this.files = [];

    this.dbWrapper = new DbWrapper();
    this.dispatcher = new Dispatcher();
    this.mediaCrawler = new MediaCrawler();
    this.mediaComposer = new MediaComposer();
    this.mediaLoader = new MediaLoader();
    this.metaReader = new DummyMetaReader();
    this.storeManager = new TestManager();

    this.factory = new Factory(this.storeManager);
  }

  // ........................................................

  init() {
    return this.factory.loadObjects(this);
  }

  // ........................................................

  shutdown() {
    return this.factory.shutdown();
  }

  // ........................................................

  get crawlerState() {
    const { storeManager } = this;
    if (!storeManager) return {};
    return storeManager.crawlerState;
  }

  // ........................................................

  createFileSystemStructure(basePath, width, depth, fileCountPerFolder) {
    if (depth === 0) {
      this.fillFiles(basePath, fileCountPerFolder);
    }

    if (depth > 0) {
      for (let w = 0; w < width; w++) {
        do {
          const subDirName = stringUtils.randomString(8);
          const subDir = path.join(basePath, subDirName);
          if (fs.existsSync(subDir)) continue;
          this.createTestDir(subDir);
          this.createFileSystemStructure(
            subDir,
            width,
            depth - 1,
            fileCountPerFolder
          );
        } while (false);
      }
    }
  }

  // ........................................................

  createFileSystemStructureRand(basePath, width, depth, fileCountPerFolderMin, fileCountPerFolderMax) {
    if (depth === 0) {
      const offset =  Math.floor((fileCountPerFolderMax - fileCountPerFolderMin) * Math.random());
      this.fillFiles(basePath, fileCountPerFolderMin + offset);
    }

    if (depth > 0) {
      for (let w = 0; w < width; w++) {
        do {
          const subDirName = stringUtils.randomString(8);
          const subDir = path.join(basePath, subDirName);
          if (fs.existsSync(subDir)) continue;
          this.createTestDir(subDir);
          this.createFileSystemStructureRand(
            subDir,
            width,
            depth - 1,
            fileCountPerFolderMin, fileCountPerFolderMax
          );
        } while (false);
      }
    }
  }

  // ........................................................

  createSingleDir(basePath, countDirs, countFiles) {
    this.fillFiles(basePath, countFiles);

    for (let i = 0; i < countDirs; i++) {
      do {
        const subDirName = stringUtils.randomString(8);
        const subDir = path.join(basePath, subDirName);
        if (fs.existsSync(subDir)) continue;
        this.createTestDir(subDir);
      } while (false);
    }
  }

  // ........................................................

  createTestDir(pathPart1, pathPart2) {
    let fullPath = null;
    if (!pathPart2) fullPath = pathPart1;
    else fullPath = path.join(pathPart1, pathPart2);

    fs.mkdirsSync(fullPath);

    if (!fileUtils.isDirectory(fullPath))
      throw new Error(
        `${_logKey}.createTestDir - cannot create directory '${fullPath}'!`
      );

    this.dirs.push(fullPath);
  }

  // ........................................................

  fillFiles(dir, fileCount) {
    for (let i = 0; i < fileCount; i++) {
      const ext = DummyTestSystem.getRandomImageExt();

      do {
        const fileName = `${stringUtils.randomString(8)}.${ext}`;
        const filePath = path.join(dir, fileName);
        if (fs.existsSync(filePath))
          continue;

        const rating = Math.floor(5 * Math.random());
        this.saveTestFile(dir, fileName, rating);
      } while (false);
    }
  }

  // ........................................................

  saveTestFile(dir, fileName, rating = 0, tags = null) {
    if (!tags)
      tags = [];

    const time = Math.floor(Date.now() * Math.random());

    const fileItem = this.mediaComposer.createFileItem({
      fileName,
      rating,
      tags,
      time
    });

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(fileItem), 'utf8');

    this.files.push(filePath);

    return filePath;
  }

  // ........................................................

  static readTestFile(pathPart1, pathPart2) {
    let filePath = null;
    if (!pathPart2) filePath = pathPart1;
    else filePath = path.join(pathPart1, pathPart2);

    const fileItem = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return fileItem;
  }

  // ........................................................

  static getRandomImageExt() {
    const exts = ['jpg', 'JPG', 'jpG', 'jpEg', 'Jpeg', 'JPEG'];

    const randomIndex = Math.floor(exts.length * Math.random());

    return exts[randomIndex];
  }

  // ........................................................
}
