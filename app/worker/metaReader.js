import {ExifTool} from "exiftool-vendored";
import log from 'electron-log';
import path from 'path';
import fs from 'fs';

// ----------------------------------------------------------------------------------

const _logKey = "metaReader";

// ----------------------------------------------------------------------------------

export class MetaReader {

  constructor() {

    this.data = MetaReader.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);

    this.deliverMeta = this.deliverMeta.bind(this);
  }


  // ........................................................

  static createDefaultData() {
    return {
      exiftoolInitialized: false,
      exiftool: null,
      exiftoolFallback: true
    };
  }

  // ........................................................

  coupleObjects(input) {
    const func = ".coupleObjects";
    log.debug(`${_logKey}${func}`);;

    this.data.config = input.config;
    this.data.processConnector = input.processConnector;
  }

  // ........................................................

  init() {
    const func = ".init";

    const instance = this;

    const p = new Promise(function(resolve, reject) {

      if (instance.data.exiftoolInitialized || instance.data.exiftool) {
        resolve();
        return;
      }

      log.debug(`${_logKey}${func}`);

      instance.data.exiftoolInitialized = true;
      instance.data.exiftoolFallback = false; //instance.data.config....exiftoolFallback;

      try {
        const exiftool = MetaReader.createNewExifTool(instance.data.config.exiftoolPath);

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
      log.debug(`${_logKey}${func}`);
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

      const maxProcs = void(0);
      const maxTasksPerProcess = void(0);
      const spawnTimeoutMillis = void(0);
      const taskTimeoutMillis = void(0);
      const onIdleIntervalMillis = void(0);
      const taskRetries = void(0);
      const batchClusterOpts = void(0);
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

    if (!this.data.exiftool)
      return;

    const p = new Promise(function(resolve, reject) {
      log.debug(`${_logKey}${func}: in - ${file}`);

      if (this.data.exiftool) {
        this.data.exiftool
          .read(file)
          .then(tags => resolve(prepareTagsFromExiftool(file, tags)))
          .catch(err => reject(err));
      } else {
        // TODO implement fallback to ExifReader
        reject(new Error ("exiftool is not initialied (and fallback ist not implemented)!"));
      }
    });

    return p;
  }

  // ........................................................


}

// ----------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------

export function prepareTagsFromExiftool(file, tags) {
  let temp = null;

  const filtered = {
    file,
    basename: path.basename(file),
    folder: path.dirname(file),
  };

  filtered.ImageHeight = tags.ImageHeight;
  filtered.ImageWidth = tags.ImageWidth;

  filtered.Model = tags.Model;
  filtered.Lens = tags.LensID || tags.LensInfo || tags.Lens || tags.LensModel;

  filtered.ShutterSpeed = tags.ShutterSpeedValue || tags.ShutterSpeed || tags.FNumber;
  filtered.Aperture = tags.ApertureValue || tags.Aperture || tags.FNumber;
  filtered.ISO = tags.ISO;
  filtered.Flash = tags.Flash;

  temp = validateInt(tags.FocalLength);
  if (temp)
    filtered.FocalLength = `${temp} mm`;

  temp = validateInt(tags.UprightFocalLength35mm);
  if (temp)
    filtered.UprightFocalLength35mm = `${temp} mm`;

  filtered.GPSAltitude = tags.GPSAltitude; // '255.3837 m'
  filtered.GPSLatitude = tags.GPSLatitude; // 51.02369333
  filtered.GPSLatitudeRef = tags.GPSLatitudeRef; // 'North'
  filtered.GPSLongitude = tags.GPSLongitude; // 13.65431667
  filtered.GPSLongitudeRef = tags.GPSLongitudeRef; // 'East'
  filtered.GPSPosition = tags.GPSPosition; // '51.02369333 N, 13.65431667 E'
  filtered.GPSVersionID = tags.GPSVersionID; // '2.2.0.0'

  filtered.Country = tags.Country; // 'Deutschland'
  filtered.Province = tags.State || tags['Province-State']; // 'Sachsen'
  filtered.City = tags.City; // 'Freital'


  filtered.Rating = tags.Rating;

  filtered.DateCreatedValue = validateExifDate(tags.DateTimeOriginal) || validateExifDate(tags.DateCreated)
                                || validateExifDate(tags.CreateDate) || tags.DateTimeCreated;

  filtered.Keywords = tags.Keywords;

  //log.info(`${logKey}${func} - ${file}: `)

  return filtered;
}

// ----------------------------------------------------------------------------------

export function validateInt(input) {

  const num = parseInt(input, 10);

  if (Number.isNaN(num))
    return null;

  return num;
}

// ----------------------------------------------------------------------------------

export function validateExifDate(input) {

  if (!input)
    return null;

  if (input.year && input.month && input.day && input.hour && input.minute) {
    const date = new Date();

    date.setFullYear(input.year);
    date.setMonth(input.month);
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
