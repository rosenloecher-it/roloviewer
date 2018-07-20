import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import {CrawlerBase} from "./crawlerBase";
import * as actionsSlideshow from "../../common/store/slideshowActions";

// ----------------------------------------------------------------------------------

const _logKey = "mediaWeigher";

const DAY0 = 0;

// ----------------------------------------------------------------------------------

export class MediaComposer extends CrawlerBase {

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

  evaluateFileItem(fileItem) {

    if (!fileItem)
      return;

    const {data} = this;

    if (!fileItem.lastShown)
      fileItem.lastShown = DAY0;
    const diffDays = MediaComposer.time2days(fileItem.lastShown - DAY0);

    const rating = fileItem.rating || 0;

    const weightTime = diffDays;
    const weightRating = -1 * rating * data.factorRating;

    fileItem.weight = weightTime + weightRating;
  }

  // .......................................................

  evaluateFile(dirItem, fileName) {
    const func = 'evaluateFile';

    if (!dirItem || !fileName)
      return;

    for (let i = 0; i < dirItem.fileItems.length; i++) {
      const fileItem = dirItem.fileItems[i];
      if (fileItem.fileName === fileName) {
        this.evaluateFileItem(fileItem);
        return;
      }
    }

    throw new Error(`${_logKey}${func} - could not find fileName (${fileName})!`);
  }

  // .......................................................

  evaluateDir(dirItem) {

    if (!dirItem)
      return;

    if (!dirItem.fileItems || dirItem.fileItems.length === 0) {
      dirItem.weight = constants.CRAWLER_MAX_WEIGHT;
      return;
    }

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
    const diffDays = MediaComposer.time2days(dirItem.lastShown - DAY0);
    const weightTime = diffDays;

    dirItem.weight = weightTime + weightFilesAverage + weightFilesCount;

  }

  // .......................................................

  randomSelectFilesFromDir(dirItem, selectionCount, checkExistence = false) {

    if (!dirItem || !dirItem.fileItems)
      return null;

    const {fileItems} = dirItem;

    if (!selectionCount || fileItems.length === 0)
      return [];

    const candidates = [];

    for (let i = fileItems.length - 1 ; i >= 0; i--)
      candidates.push(fileItems[i]);

    const maxSelections = Math.min(selectionCount, candidates.length);

    const selections = [];
    // for (let i = 0; i < maxSelections; i++) {
    //
    //   // TODO check existence (while loop)
    //
    //   const random = this.randomWeighted(candidates.length - 1);
    //   const currentIndex = candidates.length - 1 - random;
    //   const currentSelection = candidates[currentIndex];
    //   selections.push(currentSelection);
    //
    //   candidates.splice(currentIndex, 1);
    // }



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


    return selections;
  }


  // ........................................................

  static skipSourceFolder(sourceFolderIn, blacklistFolders, blacklistSnippets) {

    // blacklistFolders: normalized
    // blacklistSnippets: .trim.toLowercase

    // https://nodejs.org/api/path.html

    if (!sourceFolderIn)
      return true;

    const sourceFolder = path.normalize(sourceFolderIn);

    // not testable
    // if (!fs.lstatSync(sourceFolder).isDirectory())
    //   return true;

    for (let i = 0; i < blacklistFolders.length; i++) {
      const found = sourceFolder.indexOf(blacklistFolders[i]);
      if (found === 0)
        return true;
    }

    if (blacklistSnippets.length > 0) {
      const sourceFolderLowerCase = sourceFolder.toLowerCase();
      for (let i = 0; i < blacklistSnippets.length; i++) {
        const found = sourceFolderLowerCase.indexOf(blacklistSnippets[i]);
        if (found > -1)
          return true;
      }
    }

    return false;
  }

  // .......................................................

}

// ---------------------------------------------------------------------------------
