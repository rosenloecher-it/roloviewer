import log from 'electron-log';
import {CrawlerBase} from "./CrawlerBase";

// ----------------------------------------------------------------------------------

const _logKey = "dbWrapper";

// ----------------------------------------------------------------------------------

export class DbWrapper extends CrawlerBase {

  constructor() {
    super();

    this.data = {
      dbfile: null
    };

  }

  // ........................................................

  open(dbfile) {
    const func = ".open";

    const p = new Promise(function openPromise(resolve, reject) {
      log.debug(`${_logKey}${func} -`, dbfile);
      resolve();
    });

    return p;
  }

  // ........................................................

  close() {
    const func = ".close";

    const p = new Promise(function closePromise(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................


}



// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------
