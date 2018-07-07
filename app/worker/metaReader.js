import {ExifTool} from "exiftool-vendored";
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../common/constants";
import { shortenString } from "../common/stringUtils";
import { validateInt } from '../common/validate';
import {separateFilePath} from "../common/transfromPath";

// ----------------------------------------------------------------------------------

const _logKey = "metaReader";

// ----------------------------------------------------------------------------------

export class MetaReader {

  constructor() {

    this.data = MetaReader.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.deliverMeta = this.deliverMeta.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.transformAndDeliverTags = this.transformAndDeliverTags.bind(this);
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

    const p = new Promise(function initPromise(resolve, reject) {

      if (instance.data.exiftoolInitialized || instance.data.exiftool) {
        resolve();
        return;
      }

      log.silly(`${_logKey}${func}`);

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

    if (!this.data.exiftool)
      return;

    const instance = this;

    const p = new Promise(function deliverMetaPromise(resolve, reject) {
      try {
        //log.debug(`${_logKey}${func}: in - ${file}`);

        if (instance.data.exiftool) {
          instance.data.exiftool.read(file).then((tags) => {
            //log.debug(`${_logKey}${func}: in2 - ${file}`);
            instance.transformAndDeliverTags(file, tags);
            resolve();
            return true;
          }).catch((err) => {
            log.error(`${_logKey}${func} - exception - `, err);
            instance.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, `exception - ${_logKey}${func} - ${err}`);
            reject(err);
            return false;
          });
        } else {
          // TODO implement fallback to ExifReader
          reject(new Error("exiftool is not initialied (and fallback is not implemented)!"));
        }
      } catch (err) {
        log.error(`${_logKey}${func} - exception:`, err);
        instance.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, `exception - ${_logKey}${func} - ${err}`);
        reject();
      }
    });

    return p;
  }

  // ........................................................

  transformAndDeliverTags(file, tags) {
    const func = ".transformAndDeliverTags";

    const meta = prepareTagsFromExiftool(file, tags);
    this.data.processConnector.send(constants.IPC_RENDERER, constants.ACTION_DELIVER_FILE_META, meta);
      //ipcTarget, ipcType, payload);

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

  temp = validateInt(tags.FocalLength);
  if (temp)
    meta.photoFocalLength = `${temp} mm`;

  temp = validateInt(tags.UprightFocalLength35mm);
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
