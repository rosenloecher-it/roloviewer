import log from 'electron-log';
import ExifReader from 'exifreader';

// ----------------------------------------------------------------------------------

// https://github.com/mattiasw/ExifReader

const _logKey = "metaReaderIntern";

// ----------------------------------------------------------------------------------

export class MetaReaderIntern {

  // ........................................................

  readMeta(file, prepareOnlyCrawlerTags) {

    return Promise.resolve();

    const func = ".readMeta"; // for crawler
    const instance = this;

    const p = new Promise((resolve, reject) => {

      // const meta = ExifReader.load(file);
      // resolve(meta);
      resolve(null);

    }).catch((err) => {
      log.error(`${_logKey}${func}.promise.catch -`, err);
      throw err;
    });

    return p;
  }

  // ........................................................

  static createReader() {
    return null;
  }
}

