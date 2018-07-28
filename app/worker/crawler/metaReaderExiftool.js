import {ExifTool} from "exiftool-vendored";
import { exec } from 'child_process';
import log from 'electron-log';
import fs from 'fs';
import * as constants from "../../common/constants";
import { shortenString } from "../../common/utils/stringUtils";
import { isWinOs } from "../../common/utils/systemUtils";
import { valiInt } from '../../common/utils/validate';
import {separateFilePath} from "../../common/utils/transfromPath";
import {CrawlerBase} from "./crawlerBase";
import {MetaReader} from "./metaReader";

// ----------------------------------------------------------------------------------

const _logKey = "metaReaderExiftool";

// ----------------------------------------------------------------------------------

export class MetaReaderExiftool extends CrawlerBase {

  constructor(exiftoolPath) {
    super();

    this.data.exiftoolPath = exiftoolPath;
    this.data.exiftool = null;

  }

  // ........................................................

  init() {
    const func = ".init";

    const instance = this;
    const {data} = instance;

    const p = super.init().then(() => {

      if (instance.data.exiftool)
        return Promise.resolve();

      if (data.exiftoolPath !== '.' && data.exiftoolPath && fs.existsSync(data.exiftoolPath)) {

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

        data.exiftool = new ExifTool(maxProcs, maxTasksPerProcess, spawnTimeoutMillis, taskTimeoutMillis, onIdleIntervalMillis, taskRetries, batchClusterOpts
          , data.exiftoolPath);
      } else {
        data.exiftool = new ExifTool();
      }

      const p2 = data.exiftool.version().then((version) => {
        let logPath = '';
        if (data.exiftoolPath)
          logPath = ` (${data.exiftoolPath})`;
        log.info(`${_logKey}${func} - connected ExifTool v${version}${logPath}`);
        return Promise.resolve();
      }).catch((err) => {
        instance.logAndRethrowError(`${_logKey}${func}.inner.promise.catch`, err);
      });

      return p2;

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const instance = this;
    const {data} = this;

    const p = new Promise((resolve) => {
      //log.silly(`${_logKey}${func}`);

      const currentExifTool = data.exiftool;
      data.exiftool = null;
      if (currentExifTool)
        currentExifTool.end();

      resolve();

    }).then(() => {
      return super.shutdown();

    }).catch((err) => {
      instance.logAndRethrowError(`${_logKey}${func}.promise.catch`, err);
    });

    return p;
  }

  // ........................................................

  readMeta(file, prepareOnlyCrawlerTags) {

    const func = ".readMeta";
    const instance = this;

    if (!fs.lstatSync(file).isFile()) {
      log.error(`${_logKey}${func} - no media file!`, file);
      return Promise.resolve(null);
    }

    if (!instance.data.exiftool)
      return Promise.reject(new Error('no exiftool'));

    const p = instance.data.exiftool.read(file).then((tags) => {

      const meta = MetaReaderExiftool.prepareTagsFromExiftool(file, tags, prepareOnlyCrawlerTags);

      return Promise.resolve(meta);

    }).catch((err) => {
      log.error(`${_logKey}${func}.promise.catch -`, err);
      throw err;
    });

    return p;
  }

  // ........................................................

  static createReader(exiftoolPath) {

    return new MetaReaderExiftool(exiftoolPath);
  }

  // ........................................................

  static determineExifToolPath(systemState) {
    const func = '.determineExifToolPath';

    try {
      if (systemState.exiftool === '-')
        return Promise.resolve(null);

      if (systemState.exiftool) {
        const isFile = fs.lstatSync(systemState.exiftool).isFile();
        if (isFile)
          return Promise.resolve(systemState.exiftool);
      }

      return MetaReaderExiftool.findExifTool();

    } catch (err) {
      log.error(`${_logKey}${func} -`, err);
      return Promise.resolve(null);
    }
  }

  // ........................................................

  static findExifTool() {
    const func = ".findExifTool";

    if (isWinOs())
      return Promise.resolve();

    const toolName ='exiftool';
    const command = `bash -c "type -p ${toolName}"`;

    const p = new Promise((resolve) => {
      exec(command, (err, stdout, stderr) => {

        if (err) {
          log.error(`${_logKey}${func}.callback - command failed >>${command}<< -`, stderr);
          resolve(null);
          return;
        }

        const lines = stdout.split('\n');
        if (lines.length <= 0) {
          resolve(null);
          return;
        }

        const candidate = lines[0];
        const isFile = fs.lstatSync(candidate).isFile();

        if (!isFile) {
          log.warn(`${_logKey}${func}.callback - cannot parse output or file does not exist (>>${command}<< => >>${stdout}<<)!`);
          resolve(null);
          return;
        }

        resolve(candidate);

      });

    }).catch((err) => {
      log.error(`${_logKey}${func}.promise.catch -`, err);
      return Promise.resolve(null);
    });

    return p;
  }

  // ........................................................

  static prepareTagsFromExiftool(file, tags, prepareOnlyCrawlerTags = false) {
    let temp = null;
    const ml = 50; // maxLength

    //log.debug(`${_logKey}.prepareTagsFromExiftool - file=${file}`, tags);

    const sepPath = separateFilePath(file, 4);
    const meta = {
      file,
      filename: sepPath.filename,
      dir: sepPath.dir,
    };

    meta.time = MetaReader.validateExifDate(tags
      .DateTimeOriginal);
    if (!meta.time)
      meta.time = MetaReader.validateExifDate(tags.DateCreated);
    if (!meta.time)
      meta.time = MetaReader.validateExifDate(tags.CreateDate);
    if (!meta.time)
      meta.time = MetaReader.validateExifDate(tags.DateTimeCreated);

    meta.tags = tags.Keywords;
    meta.rating = tags.Rating;

    if (prepareOnlyCrawlerTags === false) {

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
        meta.photoSettings = MetaReader.pushDetails(meta.photoSettings, meta.photoShutterSpeed + "s");
      if (meta.photoAperture)
        meta.photoSettings = MetaReader.pushDetails(meta.photoSettings, "f" + meta.photoAperture);
      if (meta.photoISO)
        meta.photoSettings = MetaReader.pushDetails(meta.photoSettings, "ISO " + meta.photoISO);

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

      meta.gpsLocation = MetaReader.pushDetails(meta.gpsLocation, meta.gpsCity);
      meta.gpsLocation = MetaReader.pushDetails(meta.gpsLocation, meta.gpsProvince);
      meta.gpsLocation = MetaReader.pushDetails(meta.gpsLocation, meta.gpsCountry);
      meta.gpsLocation = shortenString(meta.gpsLocation, ml);
    }

    return meta;
  }

  // ........................................................

}

// ----------------------------------------------------------------------------------
