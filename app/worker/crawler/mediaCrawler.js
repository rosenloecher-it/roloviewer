import log from 'electron-log';
import {CrawlerBase} from "./CrawlerBase";

// ----------------------------------------------------------------------------------

const _logKey = "mediaCrawler";

// ----------------------------------------------------------------------------------

export class MediaCrawler extends CrawlerBase {

  constructor() {
    super();

  }

  // ........................................................

  startNew() {
    const func = ".startNew";

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  updateFile(file) {
    const func = ".updateFile";

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // .......................................................

  evalFolder(folder) {
    const func = ".evalFolder";

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // .......................................................

  updateFolder(folder) {
    const func = ".updateFolder";

    const p = new Promise((resolve, reject) => {
      //log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // .......................................................



}

// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------



