import {ExifTool} from "exiftool-vendored";
import log from 'electron-log';
import fs from 'fs';
import * as constants from "../../common/constants";
import { shortenString } from "../../common/utils/stringUtils";
import { valiInt } from '../../common/utils/validate';
import {separateFilePath} from "../../common/utils/transfromPath";
import * as slideshowActions from "../../common/store/slideshowActions";
import {CrawlerBase} from "./CrawlerBase";

// ----------------------------------------------------------------------------------

const _logKey = "metaReader";

// ----------------------------------------------------------------------------------

export class MetaReader extends CrawlerBase {

  constructor() {
    super();

    this.data.exiftoolInitialized = false;
    this.data.exiftool = null;
    this.data.exiftoolFallback = true;

  }

  // ........................................................

  init() {
    const func = ".init";

    super.init();

    const instance = this;

    const p = new Promise(function initPromise(resolve, reject) {

      if (instance.data.exiftoolInitialized || instance.data.exiftool) {
        resolve();
        return;
      }

      log.silly(`${_logKey}${func}`);

      instance.data.exiftoolInitialized = true;
      instance.data.exiftoolFallback = false; //instance.data.config....exiftoolFallback;

      try {
        const exiftool = MetaReader.createNewExifTool(instance.data.storeManager.exiftoolPath);

        exiftool.version()
          .then((version) => {
            log.info(`${_logKey}${func} - success - ExifTool v${version}`);
            instance.data.exiftool = exiftool;
            resolve();
          })
          .catch((err) => {
            log.error(`${_logKey}${func} - failed - `, err);
            reject();
          });

      } catch (err) {
        log.error(`${_logKey}${func} - exception:`, err);
        reject();
      }

      resolve();
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise((resolve, reject) => {
      log.silly(`${_logKey}${func}`);
      if (this.data.exiftool)
        this.data.exiftool.end();
      this.data.exiftool = null;
      resolve();
    });

    return p;
  }

  // ........................................................

  static createNewExifTool(exiftoolPath) {
    const func = ".createNewExifTool";

    let exiftool = null;

    if (exiftoolPath && fs.existsSync(exiftoolPath)) {

      /* eslint-disable no-void */
      const maxProcs = void(0);
      const maxTasksPerProcess = void(0);
      const spawnTimeoutMillis = void(0);
      const taskTimeoutMillis = void(0);
      const onIdleIntervalMillis = void(0);
      const taskRetries = void(0);
      const batchClusterOpts = void(0);
      /* eslint-enable no-void */

      //const exiftoolPath = '/usr/bin/exiftool';

      exiftool = new ExifTool(maxProcs, maxTasksPerProcess, spawnTimeoutMillis, taskTimeoutMillis, onIdleIntervalMillis, taskRetries, batchClusterOpts
        , exiftoolPath);
      log.debug(`${_logKey}${func} - path ${exiftoolPath}`);
    } else {
      exiftool = new ExifTool();
      log.debug(`${_logKey}${func} - without path!`);
    }

    return exiftool;
  }


  // ........................................................

  deliverMeta(file) {
    const func = ".deliverMeta";

    //log.debug(`${_logKey}${func} - in`, file);

    const instance = this;
    const {storeManager} = instance.data;

    const p = new Promise((resolve, reject) => {

      //log.debug(`${_logKey}${func}: in - ${file}`);
      if (instance.data.exiftool) {
        instance.data.exiftool.read(file).then((tags) => {
          //log.debug(`${_logKey}${func}: in2 - ${file}`);
          instance.transformAndDeliverTags(file, tags);
          resolve();
        }).catch((err) => {
          log.error(`${_logKey}${func} - exception - `, err);
          reject(err);
        });
      } else {
        // TODO implement fallback to ExifReader
        //reject(new Error("exiftool is not initialied (and fallback is not implemented)!"));
        log.warn(`${_logKey}${func} - exiftool is not initialied (and fallback is not implemented)!`);
        resolve();
      }

    });

    return p;
  }

  // ........................................................

  transformAndDeliverTags(file, tags) {
    const func = ".transformAndDeliverTags";

    const meta = prepareTagsFromExiftool(file, tags);

    const action = slideshowActions.createActionDeliverFileMeta(meta);

    this.data.storeManager.dispatchRemote(action, null);

    //log.debug(`${_logKey}${func} - cameraModel=${meta.cameraModel} - file=${file}`);
  }
}

// ----------------------------------------------------------------------------------

export function pushDetails(inputText, addText) {
  if (!addText)
    return inputText;
  if (!inputText)
    return addText;
  else
    return inputText + " | " + addText;
}

// ----------------------------------------------------------------------------------

export function prepareTagsFromExiftool(file, tags) {
  let temp = null;
  const ml = 50; // maxLength

  //log.debug(`${_logKey}.prepareTagsFromExiftool - file=${file}`, tags);

  const sepPath = separateFilePath(file, 4);
  const meta = {
    file,
    filename: sepPath.filename,
    dir: sepPath.dir,
  };

  meta.imageHeight = tags.ImageHeight;
  meta.imageWidth = tags.ImageWidth;
  meta.imageSize = `${tags.ImageWidth}x${tags.ImageHeight}`;

  meta.cameraModel = shortenString(tags.Model, ml);
  meta.cameraLens = shortenString(tags.LensID || tags.LensInfo || tags.LensModel || tags.Lens, ml);

  meta.photoShutterSpeed = tags.ShutterSpeedValue || tags.ShutterSpeed || tags.FNumber;
  meta.photoAperture = tags.ApertureValue || tags.Aperture || tags.FNumber;
  meta.photoISO = tags.ISO;
  meta.photoFlash = tags.Flash;

  if (meta.photoShutterSpeed)
    meta.photoSettings = pushDetails(meta.photoSettings, meta.photoShutterSpeed + "s");
  if (meta.photoAperture)
    meta.photoSettings = pushDetails(meta.photoSettings, "f" + meta.photoAperture);
  if (meta.photoISO)
    meta.photoSettings = pushDetails(meta.photoSettings, "ISO " + meta.photoISO);

  temp = valiInt(tags.FocalLength);
  if (temp)
    meta.photoFocalLength = `${temp} mm`;

  temp = valiInt(tags.UprightFocalLength35mm);
  if (temp)
    meta.photoUprightFocalLength35mm = `${temp} mm`;

  meta.gpsAltitude = tags.GPSAltitude; // '255.3837 m'
  meta.gpsLatitude = tags.GPSLatitude; // 51.02369333
  meta.gpsLatitudeRef = tags.GPSLatitudeRef; // 'North'
  meta.gpsLongitude = tags.GPSLongitude; // 13.65431667
  meta.gpsLongitudeRef = tags.GPSLongitudeRef; // 'East'
  meta.gpsPosition = tags.GPSPosition; // '51.02369333 N, 13.65431667 E'
  meta.gpsVersionID = tags.GPSVersionID; // '2.2.0.0'

  meta.gpsCountry = shortenString(tags.Country, ml); // 'Deutschland'
  meta.gpsProvince = shortenString(tags.State || tags['Province-State'], ml); // 'Sachsen'
  meta.gpsCity = shortenString(tags.City, ml); // 'Freital'

  meta.gpsLocation = pushDetails(meta.gpsLocation, meta.gpsCity);
  meta.gpsLocation = pushDetails(meta.gpsLocation, meta.gpsProvince);
  meta.gpsLocation = pushDetails(meta.gpsLocation, meta.gpsCountry);
  meta.gpsLocation = shortenString(meta.gpsLocation, ml);

  meta.rating = tags.Rating;

  meta.date = validateExifDate(tags.DateTimeOriginal) || validateExifDate(tags.DateCreated)
                                || validateExifDate(tags.CreateDate) || tags.DateTimeCreated;

  meta.keywords = tags.Keywords;

  return meta;
}

// ----------------------------------------------------------------------------------

export function validateExifDate(input) {

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

// ----------------------------------------------------------------------------------

export function formatGpsMeta(meta, format) {
  const func = '.formatGpsMeta';

  if (!format)
    return null;

  let url =  null;
  let file = ";"

  do {

    if (!meta || !meta.gpsLatitude || !meta.gpsLatitudeRef || !meta.gpsLongitude || !meta.gpsLongitudeRef) {
      if (meta.file)
        file = ` (${meta.file})`;
      log.warn(`${_logKey}${func} - missing meta!`);
      break;
    }

    file = ` (${meta.file})`;

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
      latiRef = 'e';
      latiMinus = '';
    } else if (longRel === 'west') {
      latiRef = 'w';
      latiMinus = '-';
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


  //var str = "Visit Microsoft!";
  //var res = str.replace("Microsoft", "W3Schools");

//log.debug(`${_logKey}${func} - meta`, currentItem.meta);


  // London: http://www.openstreetmap.org/?mlat=52.51858&mlon=13.37603&zoom=15&layers=M
  // Queentown: http://www.openstreetmap.org/?mlat=-45.01815333&mlon=168.71480833&zoom=15&layers=M

  // gpsLatitude: 60.88714333,
  // gpsLatitudeRef: 'North',
  // gpsLongitude: 6.853205,
  // gpsLongitudeRef: 'East',
  // gpsPosition: '60.88714333 N, 6.85320500 E',

  // samples: /home/data/mymedia/200x/2007/20070201 New Zealand Trip/20070303 Glenorgy







}

// ----------------------------------------------------------------------------------
