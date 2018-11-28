import log from 'electron-log';
import fs from 'fs-extra';
import Datastore from 'nedb';
import path from 'path';
import {CrawlerBase} from "./crawlerBase";
import * as constants from "../../common/constants";
import {mkDirWithParents} from "../../common/utils/fileUtils";
import {CrawlerReducer} from "../../common/store/crawlerReducer";

// ----------------------------------------------------------------------------------

const _logKey = "dbWrapper";

const STATUS_ID = '1';

// ----------------------------------------------------------------------------------

export class DbWrapper extends CrawlerBase {

  constructor() {
    super();

    this.dbDir = null;
    this.dbState = null;

  }

  // ........................................................

  init() {
    const func = ".init";

    const instance = this;

    const p = new Promise((resolve) => {

      const databasePath = instance.objects.storeManager.databasePath;
      if (!databasePath)
        throw new Error(`no db file!`);

      mkDirWithParents(databasePath);

      const isProduction = instance.objects.storeManager.isProduction;
      const extra = (isProduction ? '' : '_test');

      const fileDbDir = path.join(databasePath, `${constants.APP_BASENAME}${extra}_dir${constants.EXT_DATABASE}`);
      const fileDbState = path.join(databasePath, `${constants.APP_BASENAME}${extra}_status${constants.EXT_DATABASE}`);

      instance.dbDir = new Datastore({ filename: fileDbDir, autoload: true });
      instance.dbState = new Datastore({ filename: fileDbState, autoload: true });

      log.info(`${_logKey}${func} - fileDbDir: ${fileDbDir}`);
      log.info(`${_logKey}${func} - fileDbState: ${fileDbState}`);

      const fileWriteTest = path.join(databasePath, `${constants.APP_BASENAME}${extra}_writetest${constants.EXT_DATABASE}`);
      DbWrapper.writeTest(fileWriteTest);

      resolve();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  static writeTest(file) {
    if (fs.existsSync(file)) {
      fs.removeSync(file);
      if (fs.existsSync(file))
        throw new Error(`cannot delete write-test-file (${file})!`);
    }

    fs.writeFileSync(file, "write-test", 'utf8');
    if (!fs.existsSync(file)) {
      throw new Error(`cannot write test-file (${file})!`);
    }
  }

  // ........................................................

  clearDb () {
    const func = ".clearDbDir";

    const instance = this;

    const p = this.clearDbDir().then(() => {

      return instance.clearDbState();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  clearDbState () {
    const func = ".clearDbState";

    const instance = this;
    const removeOptions = { multi: true };

    const p = new Promise((resolve, reject) => {

      instance.dbState.remove({}, removeOptions, (err, numRemoved) => {
        if (err)
          reject(new Error(err));

        log.debug(`${_logKey}${func} - ${numRemoved} states removed`);
        resolve();
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  clearDbDir() {
    const func = ".clearDbDir";

    const instance = this;
    const removeOptions = { multi: true };

    const p = new Promise((resolve, reject) => {

      instance.dbDir.remove({}, removeOptions, (err, numRemoved) => {
        if (err)
          reject(new Error(err));

        log.debug(`${_logKey}${func} - ${numRemoved} dirs removed`);
        resolve();
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  removeDir(dir) {
    const func = ".removeDir";

    const instance = this;
    const {mediaComposer} = this.objects;
    const wantedId = mediaComposer.convert2Id(dir);

    const p = new Promise((resolve, reject) => {
      instance.dbDir.remove({ _id: wantedId }, (err /*, doc*/) => {
        if (err)
          reject(new Error(err));

        resolve();
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  saveDir(dirItem) {
    const func = ".saveDir";

    const instance = this;
    const options = { upsert: true };

    const p = new Promise((resolve, reject) => {
      if (!dirItem || ! dirItem._id)
        reject(new Error('wrong args!'));

      instance.dbDir.update({ _id: dirItem._id }, dirItem, options, (err, numReplaced) => {
        if (err)
          reject(new Error(err));

        if (numReplaced !== 1)
          reject(new Error(`numReplaced !== 1 (${numReplaced})!`));

        //log.debug(`${_logKey}${func} - ${dirItem.dir}`);
        resolve();
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;

  }

  // .......................................................

  loadDir(dirName) {
    const func = ".loadDir";

    const instance = this;
    const {mediaComposer} = this.objects;
    const wantedId = mediaComposer.convert2Id(dirName);

    const p = new Promise((resolve, reject) => {
      instance.dbDir.findOne({ _id: wantedId }, (err, doc) => {
        if (err)
          reject(new Error(err));

        resolve(doc);
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  countDirs() {
    const func = '.countDirs';

    const instance = this;

    const p = new Promise((resolve, reject) => {
      instance.dbDir.count({}, (err, count) => {
        if (err)
          reject(new Error(err));
        resolve(count);
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  countFiles() {
    const func = '.countFiles';

    const instance = this;

    const p = new Promise((resolve, reject) => {

      instance.dbDir.find({}, { dir: 1, fileItems: 1 }, (err, dirItems) => {

        if (err)
          reject(new Error(err));

        let count = 0;
        for (let i = 0; i < dirItems.length; i++) {
          const dirItem = dirItems[i];
          count += dirItem.fileItems.length;
        }

        resolve(count);
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  countFilesShowable() {
    const func = '.countFilesShowable';

    const instance = this;

    const p = new Promise((resolve, reject) => {

      instance.dbDir.find({}, { dir: 1, fileItems: 1 }, (err, dirItems) => {

        if (err)
          reject(new Error(err));

        let count = 0;
        for (let i = 0; i < dirItems.length; i++) {
          const dirItem = dirItems[i];
          for (let k = 0; k < dirItem.fileItems.length; k++) {
            if (dirItem.fileItems[k].weight < constants.CRAWLER_MAX_WEIGHT)
              count++;
          }

        }

        resolve(count);
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  listDirsAll() {
    const func = '.listDirsAll';

    const instance = this;

    const p = new Promise((resolve, reject) => {

      instance.dbDir.find({}, { dir: 1 }, (err, docs) => {

        if (err)
          reject(new Error(err));

        //log.debug(`${_logKey}${func} - docs`, docs);

        resolve(docs);
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // .......................................................

  countDirsShowable() {
    const func = '.countDirs';

    const instance = this;

    const p = new Promise((resolve, reject) => {
      instance.dbDir.count({weight: { $lt: constants.CRAWLER_MAX_WEIGHT} }, (err, count) => {
        if (err)
          reject(new Error(err));
        resolve(count);
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  listDirsWeigthSorted() {
    const func = '.listWeigthSorted';

    const instance = this;

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);

      const maxWeight = constants.CRAWLER_MAX_WEIGHT;
      // {weight: { $lt: constants.CRAWLER_MAX_WEIGHT} }

      instance.dbDir.find({weight: { $lt: maxWeight} }, { dir: 1, lastShown: 1, weight: 1 }).sort({ weight: 1 }).exec((err, docs) => {
        if (err)
          reject(new Error(err));

        //log.debug(`${_logKey}${func} - docs`, docs);

        resolve(docs);
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  listDirsToUpdate(lastUpdatedInMinutes) {

    const func = '.listDirsToUpdate';

    const instance = this;

    const minLastUpdate = Date.now() - lastUpdatedInMinutes * 60;

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);

      instance.dbDir.find({lastUpdate: { $lt: minLastUpdate }}, { dir: 1, lastUpdate: 1 }, (err, docs) => {
        if (err)
          reject(new Error(err));

        //log.debug(`${_logKey}${func} - docs`, docs);

        resolve(docs);
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  saveState(stateIn) {
    const func = ".saveState";

    const instance = this;
    const options = { upsert: true };

    const stateCloned = CrawlerReducer.cloneCrawleState(stateIn);
    stateCloned._id = STATUS_ID;

    const p = new Promise((resolve, reject) => {

      instance.dbState.update({ _id: STATUS_ID }, stateCloned, options, (err, numReplaced) => {
        if (err)
          reject(new Error(err));

        if (numReplaced !== 1)
          reject(new Error(`numReplaced !== 1 (${numReplaced})!`));

        resolve();
      });

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  loadState() {
    const func = ".loadState";

    const instance = this;

    const p = new Promise((resolve, reject) => {

      instance.dbState.findOne({ _id: STATUS_ID }, (err, doc) => {

        if (err)
          reject(new Error(err));

        if (!doc)
          doc = {};

        resolve(doc);
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  countStates() {
    const func = '.countStates';

    const instance = this;

    const p = new Promise((resolve, reject) => {

      instance.dbState.count({}, (err, count) => {

        if (err)
          reject(new Error(err));

        resolve(count);
      });
    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }
}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
