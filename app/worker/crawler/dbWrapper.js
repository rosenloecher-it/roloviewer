import log from 'electron-log';
import Datastore from 'nedb';
import path from 'path';
import {CrawlerBase} from "./CrawlerBase";
import * as constants from "../../common/constants";
import {mkDirWithParents} from "../../common/utils/fileUtils";

// ----------------------------------------------------------------------------------

const _logKey = "dbWrapper";

const STATUS_ID = '1';

// ----------------------------------------------------------------------------------

export class DbWrapper extends CrawlerBase {

  constructor() {
    super();

    this.dbDir = null;
    this.dbStatus = null;

    if (process.platform.toLowerCase().indexOf('win') >= 0)
      this.convert2Id = this.convert2IdWindows
    else
      this.convert2Id = this.convert2IdStandard

    this.open = this.open.bind(this);
    this.openSync = this.openSync.bind(this);
    //this.coupleObjects = this.coupleObjects.bind(this);

  }

  // ........................................................

  convert2IdWindows(value) {
    return value.toLowerCase();
  }
  // ........................................................

  convert2IdStandard(value) {
    return value;
  }

  // ........................................................

  open() {
    const func = ".open";

    const instance = this;

    const p = new Promise((resolve, reject) => {
      try {
        instance.openSync();
        resolve();
      } catch (err) {
        log.error(`${_logKey}${func} failed:`. err);
        reject();
      }
    });

    return p;
  }

  openSync() {
    const func = ".openSync";

    try {
      const databasePath = this.data.storeManager.databasePath;
      if (!databasePath)
        throw new Error(`no db file!`);

      mkDirWithParents(databasePath);

      const fileDbDir = path.join(databasePath, `${constants.APP_BASENAME}Dir.db`);
      const fileDbStatus = path.join(databasePath, `${constants.APP_BASENAME}Status.db`);

      this.dbDir = null;
      this.dbStatus = null;


      this.dbDir = new Datastore({ filename: fileDbDir, autoload: true });
      this.dbStatus = new Datastore({ filename: fileDbStatus, autoload: true });

      log.debug(`${_logKey}${func} - open (in "${databasePath}")`);

    } catch (err) {
      log.error(`${_logKey}${func} failed:`. err);
      throw (err);
    }
  }

  // ........................................................

  close() {
    const func = ".close";

    const p = new Promise((resolve, reject) => {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  saveDoc(doc) {
    const func = ".saveDoc";
    const options = { upsert: true };

    const p = new Promise((resolve, reject) => {
      log.debug(`${_logKey}${func} - in `);

      if (!doc || ! doc._id)
        reject(new Error('wrong args!'));

      this.dbDir.update({ _id: doc._id }, doc, options, (err, numReplaced) => {
        if (err)
          reject(new Error(err));

        if (numReplaced !== 1)
          reject(new Error(`numReplaced !== 1 (${numReplaced})!`));

        resolve();
      });


    }).catch((err) => {
      const text = `${_logKey}${func}.promise.catch failed:`;
      log.error(`${text}:`, err);
      throw new Error(`${text} ${err}`);
    });

    return p;

  }

  // .......................................................

  loadDoc(dir) {
    const func = ".loadDoc";

    const wantedId = this.convert2Id(dir);

    const p = new Promise((resolve, reject) => {
      log.debug(`${_logKey}${func} - in`);

      this.dbDir.findOne({ _id: wantedId }, (err, doc) => {
        if (err)
          reject(new Error(err));

        resolve(doc);
      });
    }).catch((err) => {
      const text = `${_logKey}${func}.promise.catch failed:`;
      log.error(`${text}`, err);
      throw new Error(`${text} ${err}`);
    });

    return p;
  }

  // ........................................................

  listEvalSorted() {

    // return [ dirs ]

    return [];
  }

  // ........................................................

  listUpdateSorted(minDays) {

    // return [ dirs ]

    return [];
  }

  // ........................................................

  createDirDoc(input) {

    const doc = {
      _id: this.convert2Id(input.dir),
      dir: input.dir,
      files: [],
      lastShown: input.lastShown,
      lastUpdate: input.lastUpdate,
      weight: input.weight || constants.CRAWLER_TIME0
    }

    return doc;
  }

  // ........................................................

  createFileDoc(input) {

    // file
    return {};
  }

  /*
    format "dir"
      _id: path
      dir: path (unter Win unterschiedlich)
      lastShown: Date
      lastUpdate
      files: []
      eval

    format "file"
      name:
      rating:
      tags: []
      lastShown:
      lastModified: Date
      skip: boolean

  */


  saveStatus() {

  }

  loadStatus() {

  }
}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
