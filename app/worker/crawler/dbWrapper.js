import log from 'electron-log';
import Datastore from 'nedb';
import {CrawlerBase} from "./CrawlerBase";
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "dbWrapper";

const STATUS_ID = '1';

// ----------------------------------------------------------------------------------

export class DbWrapper extends CrawlerBase {

  constructor() {
    super();

    this.db = null;

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

    const p = new Promise(function openPromise(resolve, reject) {
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
      const dbFile = this.data.storeManager.database;
      if (!dbFile)
        throw new Error(`no db file!`);

      this.db = new Datastore({ filename: dbFile, autoload: true });
      log.debug(`${_logKey}${func} - open "${dbFile}"`);

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

  saveDocCallback(err, numReplaced) {
    const func = ".saveDocCallback";

    if (err)
      log.error(`${_logKey}${func} failed:`, err);
    else
      log.debug(`${_logKey}${func} - succeded (numReplaced=${numReplaced})`);
  }

  saveDoc(doc) {
    const func = ".saveDoc";

    if (!doc)
      return;

    const options = { upsert: true };

    try {

      this.db.update({ _id: doc._id }, doc, options, this.saveDocCallback);

    } catch (err) {
      log.error(`${_logKey}${func} failed:`. err);
      throw (err);
    }

    //db.update(query, update, options, callback
  }

  // .......................................................

  loadDoc(dir) {
    const func = ".loadDoc";

    try {
      const _id = this.convert2Id(dir);

      let result = null;

      this.db.find({ _id }, (err, docs) => {

        if (err) {
          log.error(`${_logKey}${func} failed:`, err);
          throw (err);
        }
        if (docs.length !== 1)
          throw new Error('expected 1 doc!');

        // docs is an array containing documents Mars, Earth, Jupiter
        // If no document is found, docs is equal to []

        result = docs[0];
        log.debug(`${_logKey}${func} - doc:`, result);

      });

      return result;

    } catch (err) {
      log.error(`${_logKey}${func} failed:`. err);
      throw (err);
    }
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



}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
