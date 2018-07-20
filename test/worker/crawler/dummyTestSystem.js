import path from 'path';
import fs from 'fs-extra';
import {DbWrapper} from "../../../app/worker/crawler/dbWrapper";
import {Factory} from "../../../app/worker/crawler/factory";
import {MediaCrawler} from "../../../app/worker/crawler/mediaCrawler";
import {TestManager} from "../../common/store/testManager";
import {MediaComposer} from "../../../app/worker/crawler/mediaComposer";
import {MediaLoader} from "../../../app/worker/crawler/mediaLoader";
import {DummyMetaReader} from "./dummyMetaReader";
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {Dispatcher} from "../../../app/worker/crawler/dispatcher";

// ----------------------------------------------------------------------------------

const _logKey = "dummyTestSystem";

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

  }F

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
    const {storeManager} = this;
    if (!storeManager)
      return {};
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
          if (fs.existsSync(subDir))
            continue;
          this.createDir(subDir);
          this.createFileSystemStructure(subDir, width, depth - 1, fileCountPerFolder);

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
        if (fs.existsSync(subDir))
          continue;
        this.createDir(subDir);
      } while (false);
    }
  }

  // ........................................................

  createDir(dir) {
    fs.mkdirsSync(dir);

    if (!fs.lstatSync(dir).isDirectory())
      throw new Error(`${_logkey}.createDir - cannot create directory '${dir}'!`);

    this.dirs.push(dir);
  }

  // ........................................................

  fillFiles(dir, fileCount) {

    const instance = this;

    for (let i = 0; i < fileCount; i++) {
      const ext = this.getRandomImageExt();

      do {
        const fileName = `${stringUtils.randomString(8)}.${ext}`;
        const filePath = path.join(dir, fileName);
        if (fs.existsSync(filePath))
          continue;

        const fileItem = this.mediaComposer.createFileItem({ fileName });

        fileItem.rating = Math.floor(5 * Math.random());

        DummyTestSystem.saveDummyFile(filePath, fileItem);

        this.files.push(filePath);
      } while (false);
    }
  }

  // ........................................................

  static saveDummyFile(filePath, fileItem) {
    fs.writeFileSync(filePath, JSON.stringify(fileItem), 'utf8');
  }


  // ........................................................

  static readDummyFile(filePath) {

    fs.readFileSync(filePath)

    const data = JSON.parse(fs.readFileSync('file', 'utf8'));

    return data;


    // fs.readFile('/path/to/file.json', 'utf8', function (err, data) {
    //   if (err) throw err; // we'll not consider error handling for now
    //   var obj = JSON.parse(data);
    // });
    //
    // fileItem

    fs.writeFileSync(filePath, JSON.stringify(fileItem));
  }

  // ........................................................

  getRandomImageExt() {
    const exts = [
      'jpg', 'JPG', 'jpG'
    ];

    const randomIndex = Math.floor(exts.length * Math.random());

    return exts[randomIndex];

  }

  // ........................................................
}
