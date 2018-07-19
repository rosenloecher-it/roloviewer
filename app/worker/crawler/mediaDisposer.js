import log from 'electron-log';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import {CrawlerBase} from "./CrawlerBase";
import * as actionsSlideshow from "../../common/store/slideshowActions";

// ----------------------------------------------------------------------------------

const _logKey = "mediaWeigher";

const DAY0 = 0;

// ----------------------------------------------------------------------------------

export class MediaDisposer extends CrawlerBase {

  constructor() {
    super();

    // TODO settings from storeManager.state
    this.data = {
      selPow: 3,

      factorTime: 1,
      factorRating: 60, // 1 point equalizes 1 days


      batchCount: 10,

    }

    if (process.platform.toLowerCase().indexOf('win') >= 0)
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
    }

    return doc;
  }

  // ........................................................

  createFileItem(input) {

    const doc = {
      id: this.convert2Id(input.fileName),
      fileName: input.fileName,
      rating: 0,
      tags: [],
      lastShown: null,
      lastModified: null,
      weight: (input.weight === null || input.weight === undefined) ? constants.CRAWLER_MAX_WEIGHT : input.weight,
    };

    return doc;
  }

  // ........................................................

  randomWeighted(length) {

    if (!length)
      return null;
    if (length === 1)
      return 0;

    const {selPow} = this.data;

    const maxRandom = length ** selPow;
    const selected = Math.floor(length - (maxRandom * Math.random()) ** (1/selPow));

    return selected;
  }

  // ........................................................

  static time2days(milliseconds) {

    if (milliseconds === null || milliseconds === undefined)
      return null;

    return milliseconds / 1000 / 60 / 60 /24;
  }

  // ........................................................

  evaluateFile(fileItem) {

    if (!fileItem)
      return;

    const {data} = this;

    if (!fileItem.lastShown)
      fileItem.lastShown = DAY0;
    const diffDays = MediaDisposer.time2days(fileItem.lastShown - DAY0);

    const rating = fileItem.rating || 0;

    const weightTime = diffDays;
    const weightRating = -1 * rating * data.factorRating;

    fileItem.weight = weightTime + weightRating;
  }

  // .......................................................

  evaluateDir(dirItem) {

    if (!dirItem)
      return;

    const {data} = this;

    dirItem.fileItems.sort((fileItem1, fileItem2) => {
      return (fileItem1.weight - fileItem2.weight);
    });

    const scanCount = Math.min(dirItem.fileItems.length, data.batchCount);

    let weightSum = 0;
    for (let i = 0; i < scanCount; i++)
      weightSum += dirItem.fileItems[i].weight;

    const weightFilesAverage = -1.0 * weightSum / scanCount;

    const weightFilesCount = -1.0 / (dirItem.fileItems.length || 1);

    if (!dirItem.lastShown)
      dirItem.lastShown = DAY0;
    const diffDays = MediaDisposer.time2days(dirItem.lastShown - DAY0);
    const weightTime = diffDays;

    dirItem.weight = weightTime + weightFilesAverage + weightFilesCount;

  }

  // .......................................................

  randomSelectFilesFromDir(dir, selectionCount) {

    if (!dir || !dir.fileItems)
      return null;

    const {fileItems} = dir;

    if (!selectionCount || fileItems.length === 0)
      return [];

    const candidates = [];

    for (let i = fileItems.length - 1 ; i >= 0; i--)
      candidates.push(fileItems[i]);

    const maxSelections = Math.min(selectionCount, candidates.length);

    const selections = [];
    for (let i = 0; i < maxSelections; i++) {

      const random = this.randomWeighted(candidates.length - 1);
      const currentIndex = candidates.length - 1 - random;
      const currentSelection = candidates[currentIndex];
      selections.push(currentSelection);

      candidates.splice(currentIndex, 1);
    }

    return selections;
  }

  // .......................................................

}

// ---------------------------------------------------------------------------------
