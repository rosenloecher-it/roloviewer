import path from 'path';
import fs from 'fs';
import log from 'electron-log'; // eslint-disable-line no-unused-vars
import * as constants from "../../common/constants";
import {CrawlerBase} from "./crawlerBase";
import {MediaLoader} from "./mediaLoader";
import {MediaFilter} from "./mediaFilter";
import {isWinOs} from "../../common/utils/systemUtils";

// ----------------------------------------------------------------------------------

const _logKey = "mediaComposer";

const DAY0 = 0;

// ----------------------------------------------------------------------------------

export class MediaComposer extends CrawlerBase {

  constructor() {
    super();

    if (isWinOs())
      this.convert2Id = this.convert2IdWindows;
    else
      this.convert2Id = this.convert2IdStandard;
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

  createDirItem(input) {

    const doc = {
      _id: this.convert2Id(input.dir),
      dir: input.dir,
      fileItems: [],
      lastShown: input.lastShown,
      lastUpdate: input.lastUpdate,
      weight: input.weight || constants.CRAWLER_MAX_WEIGHT
    };

    return doc;
  }

  // ........................................................

  createFileItem(input) {

    if (!input.fileName)
      throw new Error('(createFileItem) no fileName!');

    const doc = {
      id: this.convert2Id(input.fileName),
      repeated: input.repeated || 0,
      fileName: input.fileName,
      time: input.time || null,
      rating: input.rating || 0,
      tags: input.tags || [],
      lastShown: input.lastShown || null,
      lastModified: input.lastModified || null,
      weight: (input.weight === null || input.weight === undefined) ? constants.CRAWLER_MAX_WEIGHT : input.weight,
    };

    return doc;
  }

  // ........................................................

  randomWeighted(length) {

    if (!length)
      return null;
    if (length < 2)
      return 0;

    const crawlerState = this.objects.storeManager.crawlerState;
    const {weightingSelPow} = crawlerState;

    let selPow = weightingSelPow;
    if (length <= 10 && selPow > 2)
      selPow = 2;

    const maxRandom = length ** selPow;
    const selected = Math.floor(length - (maxRandom * Math.random()) ** (1.0/selPow));

    return selected;
  }

  // ........................................................

  static time2days(milliseconds) {

    if (milliseconds === null || milliseconds === undefined)
      return null;

    return milliseconds / 1000 / 60 / 60 /24;
  }

  // ........................................................

  findFileItem(dirItem, fileName) {

    if (!dirItem || !fileName)
      return null;

    for (let i = 0; i < dirItem.fileItems.length; i++) {
      const fileItem = dirItem.fileItems[i];
      if (fileItem.fileName === fileName) {
        return fileItem;
      }
    }

    return null;
  }

  // ........................................................

  evaluateSeasonWeight(fileItem, testTimeNow = null) {
    const func = '.evaluateFileItem'; // eslint-disable-line no-unused-vars

    if (!fileItem || !fileItem.time)
      return 0;

    const crawlerState = this.objects.storeManager.crawlerState;
    const { weightingSeason } = crawlerState;

    const maxDiffSeasonDays = constants.DEFCONF_CRAWLER_WEIGHTING_SEASON_BASE + 10; // punish files without date
    let diffSeasonDays = MediaComposer.seasonDiffDays(fileItem.time, constants.DEFCONF_CRAWLER_TODAY_SHIFT_SEASON, testTimeNow);
    if (diffSeasonDays === null || diffSeasonDays < 0)
      diffSeasonDays = maxDiffSeasonDays;

    const weightSeason = diffSeasonDays / maxDiffSeasonDays * weightingSeason;

    return weightSeason;
  }

  // ........................................................

  evaluateFileItem(fileItem, dir = '') {
    const func = '.evaluateFileItem'; // eslint-disable-line no-unused-vars

    if (!fileItem)
      return;

    const crawlerState = this.objects.storeManager.crawlerState;
    const { weightingRating, weightingRepeated, showRatings, blacklistTags, showTags } = crawlerState;

    if (!fileItem.lastShown)
      fileItem.lastShown = DAY0;

    let filterOut = false;

    let info = '';
    if (MediaFilter.filterRating(showRatings, fileItem.rating)) {
      info = 'rating';
      filterOut = true;
    }
    if (!filterOut && MediaFilter.containsTags(fileItem.tags, blacklistTags)) {
      info = 'blacklistTags';
      filterOut = true;
    }
    // filter only for tags if at least one tag is defined
    if (!filterOut && showTags.length > 0 && !MediaFilter.containsTags(fileItem.tags, showTags)) {
      info = 'whitelistTags';
      filterOut = true;
    }

    if (filterOut) {
      log.info(`suppress file (${info}): ${dir}/${fileItem.fileName}`);
      fileItem.weight = constants.CRAWLER_MAX_WEIGHT;
    }
    else {
      const diffDays = MediaComposer.time2days(fileItem.lastShown - DAY0);

      const rating = fileItem.rating || 0;
      const repeated = fileItem.repeated || 0;

      const weightTime = diffDays;
      const weightRating = -1.0 * rating * weightingRating;
      const weightRepeated = repeated * weightingRepeated;

      const weightSeason = this.evaluateSeasonWeight(fileItem);

      fileItem.weight = weightTime + weightRating + weightRepeated + weightSeason;
    }

  }

  // .......................................................

  evaluateFile(dirItem, fileName) {
    const func = '.evaluateFile';

    const fileItem = this.findFileItem(dirItem, fileName);
    if (fileItem) {
      this.evaluateFileItem(fileItem, dirItem.dir);
      return;
    }

    throw new Error(`${_logKey}${func} - cannot find fileName (${fileName})!`);
  }

  // .......................................................

  updateFileMeta(dirItem, meta) {
    const func = '.updateFileMeta';

    if (!meta)
      return;

    const fileItem = this.findFileItem(dirItem, meta.filename);
    if (!fileItem)
      throw new Error(`${_logKey}${func} - cannot find fileItem!`);

    fileItem.time = meta.time || null;
    fileItem.rating = meta.rating || 0;
    fileItem.tags = meta.tags || [];

    this.evaluateFileItem(fileItem, dirItem.dir);
  }

  // ........................................................

  rateDirByShownFile(dirItem, fileName) {

    const fileItem = this.findFileItem(dirItem, fileName);
    if (fileItem) { // fileItem could be updated and filtered in background
      fileItem.lastShown = Date.now();
      if (!fileItem.repeated)
        fileItem.repeated = 1;
      else
        fileItem.repeated++;
      this.evaluateFileItem(fileItem, dirItem.dir);
    }
    dirItem.lastShown = Date.now();
    this.evaluateDir(dirItem);
  }

  // ........................................................

  evaluateDir(dirItem) {
    const func = '.evaluateDir'; // eslint-disable-line no-unused-vars

    if (!dirItem)
      return;

    //log.debug(`${_logKey}${func} - in - weight=`, dirItem.weight);

    if (!dirItem.fileItems || dirItem.fileItems.length === 0) {
      dirItem.weight = constants.CRAWLER_MAX_WEIGHT;
      return;
    }

    const crawlerState = this.objects.storeManager.crawlerState;
    const {batchCount} = crawlerState;

    dirItem.fileItems.sort((fileItem1, fileItem2) => {
      return (fileItem1.weight - fileItem2.weight);
    });

    const scanCount = Math.min(dirItem.fileItems.length, batchCount);

    let weightSum = 0;
    for (let i = 0; i < scanCount; i++)
      weightSum += dirItem.fileItems[i].weight;

    const weightFilesAverage = weightSum / scanCount;

    const fileCountNorm = Math.min(dirItem.fileItems.length, constants.CRAWLER_NORM_FILE_COUNT);
    const weightFilesCount = -1.0 * fileCountNorm / constants.CRAWLER_NORM_FILE_COUNT;

    if (!dirItem.lastShown)
      dirItem.lastShown = DAY0;
    const diffDays = MediaComposer.time2days(dirItem.lastShown - DAY0);
    const weightTime = diffDays;

    dirItem.weight = weightTime + weightFilesAverage + weightFilesCount;

    //log.debug(`${_logKey}${func} - out - weight=`, dirItem.weight);

  }

  // .......................................................

  evaluate(dirItem) {
    const func = '.evaluate'; // eslint-disable-line no-unused-vars

    if (!dirItem)
      return;

    for (let i = 0; i < dirItem.fileItems.length; i++) {
      const fileItem = dirItem.fileItems[i];
      this.evaluateFileItem(fileItem, dirItem.dir);
    }

    this.evaluateDir(dirItem);

  }

  // .......................................................

  randomSelectFilesFromDir(dirItem, selectionCount, checkExistence = false) {

    if (!dirItem || !dirItem.fileItems)
      return null;

    const {fileItems} = dirItem;

    if (!selectionCount || fileItems.length === 0)
      return [];

    const candidates = [];

    // select from behind - reduce costs for removing elements
    for (let i = fileItems.length - 1 ; i >= 0; i--) {
      const fileItem = fileItems[i];
      if (fileItem.weight < constants.CRAWLER_MAX_WEIGHT)
        candidates.push(fileItem);
    }

    const maxSelections = Math.min(selectionCount, candidates.length);
    const selections = [];

    do {
      const random = this.randomWeighted(candidates.length - 1);
      const currentIndex = candidates.length - 1 - random;
      const currentSelection = candidates[currentIndex];

      let doAdd = true;
      if (checkExistence) {
        const fullPath = path.join(dirItem.dir, currentSelection.fileName);
        if (!fs.existsSync(fullPath))
          doAdd = false; // next try
      }

      if (doAdd)
        selections.push(currentSelection);

      candidates.splice(currentIndex, 1);

      if (selections.length >= maxSelections)
        break;
      if (candidates.length === 0)
        break;

    } while (true);

    const randomOrder = this.objects.storeManager.slideshowState.random;
    if (!randomOrder) {
      selections.sort((fileItem1, fileItem2) => {
        return MediaLoader.sortFilename(fileItem1.fileName, fileItem2.fileName);
      });
    }

    return selections;
  }

  // ........................................................

  static lastModifiedFromFile(fullPath) {

    if (!fullPath)
      return null;

    return fs.lstatSync(fullPath).mtimeMs;
  }

  // ........................................................

  static seasonDiffDays(timeMedia, shiftDaysToday = 0, timeTodayIn = null) {

    if (timeMedia === null || timeMedia === undefined)
      return null;

    const dateToday = timeTodayIn === null ? new Date() : new Date(timeTodayIn);
    const timeToday = dateToday.getTime() + shiftDaysToday * 24 * 60 * 60 * 1000;


    const dates = [];
    for (let i = -1; i < 2; i++) {
      const date = new Date(timeMedia);
      date.setFullYear(dateToday.getFullYear() + i);
      dates.push(date);
    }

    let dayDiffMin = 365;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const timeDiff = Math.abs(timeToday - date.getTime());
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24) + 0.5);
      if (dayDiffMin > dayDiff)
        dayDiffMin = dayDiff;
    }

    return dayDiffMin;
  }
}

// ---------------------------------------------------------------------------------
