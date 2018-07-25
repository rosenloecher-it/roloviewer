import log from 'electron-log';
import * as constants from "../../common/constants";
import * as rendererActions from "../../common/store/rendererActions";
import {CrawlerBase} from "./crawlerBase";
import {MetaReaderExiftool} from "./metaReaderExiftool";
import {MetaReaderIntern} from "./metaReaderIntern";

// ----------------------------------------------------------------------------------

const _logKey = "metaReader";

// ----------------------------------------------------------------------------------

export class MetaReader extends CrawlerBase {

  constructor() {
    super();

    this.data.exiftoolInitialized = false;
    this.data.reader = null;

    this.data.exiftool = null;
    this.data.exiftoolFallback = true;

  }

  // ........................................................

  init() {
    const func = ".init";

    const instance = this;
    const {data} = instance;

    const p = super.init().then(() => {

      if (data.exiftoolInitialized || data.reader)
        return Promise.resolve();

      instance.data.exiftoolInitialized = true;

      const systemState = instance.objects.storeManager.systemState;

      return MetaReaderExiftool.determineExifToolPath(systemState);

    }).then((exifToolPath) => {

      if (exifToolPath)
        data.reader = MetaReaderExiftool.createReader(exifToolPath);
      else
        data.reader = MetaReaderIntern.createReader();

      if (data.reader)
        return data.reader.init();

      log.warn(`${_logKey}${func} - no exif reader available!`);
      return Promise.resolve();

    }).catch((err) => {
      this.logAndShowError(`${_logKey}${func}.promise.catch`, err);
      data.reader = null;

      return Promise.resolve();
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const {data} = this;

    //log.debug(`${_logKey}${func} - after metaReader`);

    let p = null;
    if (data.reader)
      p = data.reader.shutdown();
    else
      p = Promise.resolve();

    p = p.then(() => {
      return super.shutdown();
    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  readMeta(file, prepareOnlyCrawlerTags) {
    const func = ".readMeta";

    const {data} = this;

    if (!data.reader)
      return Promise.resolve(null);

    const p = data.reader.readMeta(file, prepareOnlyCrawlerTags).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  loadMeta(file) {

    return this.readMeta(file, true); // (file, prepareOnlyCrawlerTags)

  }

  // ........................................................

  deliverMeta(file) {
    const func = ".deliverMeta";

    const instance = this;

    // readMeta(file, prepareOnlyCrawlerTags)
    const p = this.readMeta(file, false).then((meta) => {

      if (meta) {
        const action = rendererActions.createActionDeliverFileMeta(meta);
        instance.objects.storeManager.dispatchRemote(action, null);
      }

      return Promise.resolve();

    }).catch((err) => {
      this.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  static pushDetails(inputText, addText) {
    if (!addText)
      return inputText;
    if (!inputText)
      return addText;

    return `${inputText} | ${addText}`;
  }

  // ........................................................

  static validateExifDate(input) {

    if (!input)
      return null;

    if (input.year && input.month && input.day && input.hour && input.minute) {
      const date = new Date();

      date.setFullYear(input.year);
      date.setMonth(input.month - 1);
      date.setDate(input.day);

      date.setHours(input.hour);
      date.setMinutes(input.minute);
      date.setSeconds(input.second || 0);
      date.setMilliseconds(input.millis || 0);

      // log.debug("validateExifDate", date.toISOString());

      return date.valueOf();
    }

    return null;
  }

  // ........................................................

  static formatGpsMeta(meta, format) {
    const func = '.formatGpsMeta';

    if (!format)
      return null;

    let url =  null;

    do {

      if (!meta || !meta.gpsLatitude || !meta.gpsLatitudeRef || !meta.gpsLongitude || !meta.gpsLongitudeRef) {
        let file = '';
        if (meta.file)
          file = ` (${meta.file})`;
        log.warn(`${_logKey}${func} - missing meta${file}!`);
        break;
      }

      const latiRel = `${meta.gpsLatitudeRef.trim().toLowerCase()}`;
      const longRel = `${meta.gpsLongitudeRef.trim().toLowerCase()}`;

      let latiMinus = '', longMinus = '', latiRef = '', longRef = '';

      if (latiRel === 'north') {
        latiRef = 'n';
        latiMinus = '';
      } else if (latiRel === 'south') {
        latiRef = 's';
        latiMinus = '-';
      } else {
        log.warn(`${_logKey}${func} - unknown gpsLatitudeRef (${latiRel})!`);
        break;
      }

      if (longRel === 'east') {
        longRef = 'e';
        longMinus = '';
      } else if (longRel === 'west') {
        longRef = 'w';
        longMinus = '-';
      } else {
        log.warn(`${_logKey}${func} - unknown gpsLongitudeRef (${longRel})!`);
        break;
      }

      const latitude = Math.abs(meta.gpsLatitude);
      const longitude = Math.abs(meta.gpsLongitude);

      const latiAbs = `${latitude}`;
      const latiNum = `${latiMinus}${latitude}`;
      const longAbs = `${longitude}`;
      const longNum = `${longMinus}${longitude}`;

      let temp = format;
      temp = temp.replace(constants.LATI_ABS, latiAbs);
      temp = temp.replace(constants.LATI_NUM, latiNum);
      temp = temp.replace(constants.LATI_REF, latiRef);
      temp = temp.replace(constants.LATI_REL, latiRel);
      temp = temp.replace(constants.LONG_ABS, longAbs);
      temp = temp.replace(constants.LONG_NUM, longNum);
      temp = temp.replace(constants.LONG_REF, longRef);
      temp = temp.replace(constants.LONG_REL, longRel);
      url = temp;

    } while (false);

    return url;
  }
}

// ----------------------------------------------------------------------------------
