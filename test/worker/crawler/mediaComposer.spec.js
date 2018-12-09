import * as constants from '../../../app/common/constants';
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {MediaComposer} from "../../../app/worker/crawler/mediaComposer";
import {TestManager} from "../../common/store/testManager";

// ----------------------------------------------------------------------------------

function checkRandomWeight(disposer, countTest) {

  console.log(`checkRandomWeight(${countTest})`);

  let sum = 0;
  let max = 0;
  let min = constants.CRAWLER_MAX_WEIGHT;

  const histogram = [];
  for (let i = 0; i < countTest; i++)
    histogram.push(0);

  for (let i = 0; i < countTest; i++) {
    const value = disposer.randomWeighted(countTest);
    histogram[value] += 1;
    sum += value;
    if (max < value)
      max = value;
    if (min > value)
      min = value;
  }

  const averageNorm = sum / (countTest - 1) / countTest;
  console.log('averageNorm (0..1) =',averageNorm);
  const maxNorm = max / (countTest - 1);
  console.log('maxNorm (0..1) =',maxNorm);

  console.log('histogram =',histogram);

  expect(max).toBeLessThan(countTest);
  expect(min).toBeGreaterThanOrEqual(0);

  if (countTest >= 8) {
    expect(averageNorm).toBeGreaterThan(0);
    expect(averageNorm).toBeLessThan(0.4);
  }

}
// ----------------------------------------------------------------------------------

function checkRandomSelectFilesFromDir(composer, countFiles, countSelectDemanded, randomOrder) {

  console.log(`checkRandomSelectFilesFromDir(countFiles=${countFiles}, countSelectDemanded=${countSelectDemanded})`);
  // prepare
  const dir = {
    fileItems: []
  };

  for (let i = 0; i < countFiles; i++) {
    const fileName = stringUtils.randomString(10);
    const item = composer.createFileItem({
      fileName,
      weight: i, // no extra evaluateFileItem necessary
    });

    dir.fileItems.push(item);
  }

  composer.evaluateDir(dir);

  // start test

  const selections = composer.randomSelectFilesFromDir(dir, countSelectDemanded);

  const countSelect = Math.min(countSelectDemanded, countFiles);

  expect(selections.length).toBe(countSelect);

  // no doubles
  for (let i = 0; i < selections.length - 1; i++) {
    const selI = selections[i];
    for (let k = i + 1; k < selections.length; k++) {
      const selK = selections[k];
      expect(selI.fileName).not.toBe(selK.fileName);
    }
  }

  // check statistics
  let sum = 0;
  let max = 0;
  let min = constants.CRAWLER_MAX_WEIGHT;

  const histogram = [];
  for (let i = 0; i < countFiles; i++)
    histogram.push(0);

  for (let i = 0; i < selections.length; i++) {
    const value = selections[i].weight;
    histogram[value] += 1;
    sum += value;
    if (max < value)
      max = value;
    if (min > value)
      min = value;
  }

  const averageNorm = sum / (countFiles - 1) / selections.length;
  console.log('averageNorm (0..1) =',averageNorm);
  const maxNorm = max / (countFiles - 1);
  console.log('maxNorm (0..1) =',maxNorm);

  console.log('histogram =',histogram);

  //console.log('selections =',selections);

  expect(max).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);
  expect(averageNorm).toBeGreaterThan(0);

  if (selections.length >= 8 && selections.length > 2 * countSelectDemanded) {
    expect(averageNorm).toBeLessThan(0.4);
  }

  // checkOrder
  let sortLarger = 0;
  let sortSmaller = 0;
  let fileItemLast = null;
  for (let i = 0; i < selections.length; i++) {
    const fileItem = selections[i];

    if (i > 0) {

      const fileName = fileItem.fileName.toLowerCase();
      const fileNameLast = fileItemLast.fileName.toLowerCase();

      if (fileName > fileNameLast)
        sortLarger++;
      else if (fileName < fileNameLast)
        sortSmaller++;
    }

    fileItemLast = fileItem;
  }

  if (countSelect > 5)  {
    //console.log(`selections=`, selections);
    if (randomOrder) {
      console.log(`randomOrder=${randomOrder}: sortLarger=${sortLarger}, sortSmaller=${sortSmaller}`);
      expect(sortLarger + sortSmaller).toBe(selections.length - 1); // no fileName ===
      expect(sortLarger).toBeGreaterThan(0);
      expect(sortSmaller).toBeGreaterThan(0);
    } else {
      console.log(`randomOrder=${randomOrder}: sortLarger=${sortLarger}, sortSmaller=${sortSmaller}`);
      expect(sortLarger + sortSmaller).toBe(selections.length - 1); // no fileName ===
      expect(sortLarger).toBe(selections.length - 1);
      expect(sortSmaller).toBe(0);
    }
  }


}

// ----------------------------------------------------------------------------------

describe('mediaComposer', () => {

  it('randomWeighted', () => {

    const storeManager = new TestManager();
    const composer = new MediaComposer();
    composer.coupleObjects({storeManager});

    checkRandomWeight(composer, 20);

    checkRandomWeight(composer, 2);

    expect(composer.randomWeighted(null)).toBe(null);
    expect(composer.randomWeighted(0)).toBe(null);

    for (let i = 0; i < 3; i++)
      expect(composer.randomWeighted(1)).toBe(0);

  });

  it('time2days', () => {

    let output = null;

    const d1 = new Date(2018, 7, 7, 9, 9, 0, 0);

    const d2 = new Date(d1.getTime());
    d2.setDate(9);
    d2.setHours(21);

    output = MediaComposer.time2days(d2 - d1);

    expect(output).toBe(2.5);

    console.log('time2day', output);

  });

  // .......................................................

  it('evaluateFileItem(default)', () => {

    const storeManager = new TestManager();
    const composer = new MediaComposer();
    composer.coupleObjects({storeManager});

    const item1 = composer.createFileItem({ fileName: stringUtils.randomString(10) });
    const item2 = composer.createFileItem({ fileName: stringUtils.randomString(10) });

    item1.lastShown = new Date().getTime();
    item2.lastShown = item1.lastShown + 1 * 24 * 60 * 60 * 1000 * 60; // plus 1 day

    item1.rating = 0;
    item2.rating = 0;

    composer.evaluateFileItem(item1);
    composer.evaluateFileItem(item2);

    expect(item1.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);
    expect(item2.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    expect(item2.weight).toBeGreaterThan(item1.weight);

    item2.rating = 2;
    composer.evaluateFileItem(item2);

    expect(item1.weight).toBeGreaterThan(item2.weight);
  });

  // .......................................................

  it('evaluateFileItem(filtered)', () => {

    const storeManager = new TestManager();
    const composer = new MediaComposer();
    const crawlerState = storeManager.crawlerState;

    composer.coupleObjects({storeManager});

    const tagFound = 'found';
    const lastShown = new Date().getTime();
    let item;

    // filter whitelist
    crawlerState.showRatings = [];
    crawlerState.showTags = [ tagFound ];
    crawlerState.blacklistTags = [];
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4, tags: [ 'tag1', tagFound ] });
    composer.evaluateFileItem(item);
    expect(item.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4, tags: [ 'tag1', 'tag2' ] });
    composer.evaluateFileItem(item);
    expect(item.weight).toBe(constants.CRAWLER_MAX_WEIGHT);

    // filter blacklist
    crawlerState.showRatings = [];
    crawlerState.showTags = [];
    crawlerState.blacklistTags = [ tagFound ];
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4, tags: [ 'tag1', tagFound ] });
    composer.evaluateFileItem(item);
    expect(item.weight).toBe(constants.CRAWLER_MAX_WEIGHT);
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4, tags: [ 'tag1', 'tag2' ] });
    composer.evaluateFileItem(item);
    expect(item.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    // filter rating
    crawlerState.showRatings = [0, 2, 3, 4, 5];
    crawlerState.showTags = [];
    crawlerState.blacklistTags = [];
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 1 });
    composer.evaluateFileItem(item);
    expect(item.weight).toBe(constants.CRAWLER_MAX_WEIGHT);
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4 });
    composer.evaluateFileItem(item);
    expect(item.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    // standard
    crawlerState.showRatings = [0, 1, 2, 3, 4, 5];
    crawlerState.showTags = [];
    crawlerState.blacklistTags = [];
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4 });
    composer.evaluateFileItem(item);
    expect(item.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    crawlerState.showRatings = [];
    crawlerState.showTags = [];
    crawlerState.blacklistTags = [];
    item = composer.createFileItem({ fileName: 'item', lastShown, rating: 4 });
    composer.evaluateFileItem(item);
    expect(item.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);
  });

  // .......................................................

  it('evaluateDir - base', () => {

    const countFiles = 30;

    const storeManager = new TestManager();
    const composer = new MediaComposer();
    composer.coupleObjects({storeManager});

    // prepare
    const dir = {
      fileItems: []
    };

    // test -
    for (let i = 0; i < countFiles; i++) {
      const item = composer.createFileItem({
        fileName: stringUtils.randomString(10),
        rating: 0,
        weight: countFiles - i, // => re-sort necessary, no extra evaluateFileItem necessary
      });

      dir.fileItems.push(item);
    }

    composer.evaluateDir(dir);

    expect(dir.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    let lastWeight = 0;
    for (let i = 0; i < countFiles; i++) {
      const fileItem = dir.fileItems[i];
      if (i > 0)
        expect(fileItem.weight).toBeGreaterThanOrEqual(lastWeight);
      lastWeight = fileItem.weight;
    }

    // test - max weight for dirs without images files
    dir.fileItems = [];
    composer.evaluateDir(dir);
    expect(dir.weight).toBe(constants.CRAWLER_MAX_WEIGHT);

  });

  // .......................................................

  it('evaluate', () => {

    const countFiles = 20;

    const storeManager = new TestManager();
    const composer = new MediaComposer();
    composer.coupleObjects({storeManager});

    // prepare
    const dirItem = {
      fileItems: []
    };

    const timeNew = Date.now();
    const timeOld = timeNew - 1000 * 60 * 60 * 24; // -1 days

    // test -
    for (let i = 0; i < countFiles; i++) {
      const item = composer.createFileItem({
        fileName: stringUtils.randomString(10),
        rating: 0,
        lastShown: timeOld,
        weight: 0, // => re-sort necessary, no extra evaluateFileItem necessary
      });

      dirItem.fileItems.push(item);
    }

    composer.evaluate(dirItem);

    const weightDirOld = dirItem.weight;

    const lastFileItem = dirItem.fileItems[0];
    lastFileItem.lastShown = timeNew;

    composer.rateDirByShownFile(dirItem, lastFileItem.fileName);

    const weightDirNew = dirItem.weight;

    console.log(`weightDirNew=${weightDirNew}\nweightDirOld=${weightDirOld}`);

    expect(weightDirNew).toBeGreaterThan(weightDirOld);

    let lastWeight = 0;
    for (let i = 0; i < countFiles; i++) {
      const fileItem = dirItem.fileItems[i];
      if (i > 0) {
        //console.log(`expect(fileItem.weight == ${fileItem.weight}).toBeGreaterThanOrEqual(lastWeight == ${lastWeight})`);
        expect(fileItem.weight).toBeGreaterThanOrEqual(lastWeight);
      }
      lastWeight = fileItem.weight;
    }

    // test - max weight for dirs without images files
    dirItem.fileItems = [];
    composer.evaluate(dirItem);
    expect(dirItem.weight).toBe(constants.CRAWLER_MAX_WEIGHT);

  });

  // .......................................................

  it('randomSelectFilesFromDir', () => {

    let randomOrder = false;

    const storeManager = new TestManager();
    const mediaComposer = new MediaComposer();
    mediaComposer.coupleObjects({mediaComposer, storeManager});

    const crawlerState = storeManager.crawlerState;
    crawlerState.batchCount = 3;
    crawlerState.weightingRating = 0;
    crawlerState.weightingSelPow = 3;

    randomOrder = true;
    storeManager.slideshowState.random = randomOrder;
    checkRandomSelectFilesFromDir(mediaComposer, 30, 10, randomOrder);
    checkRandomSelectFilesFromDir(mediaComposer, 10, 10, randomOrder);
    checkRandomSelectFilesFromDir(mediaComposer, 4, 6, randomOrder);

    randomOrder = false;
    storeManager.slideshowState.random = randomOrder;
    checkRandomSelectFilesFromDir(mediaComposer, 30, 10, randomOrder);
    checkRandomSelectFilesFromDir(mediaComposer, 10, 10, randomOrder);
    checkRandomSelectFilesFromDir(mediaComposer, 4, 6, randomOrder);
  });

  // .......................................................

  it('seasonDiffDays', () => {

    let output;
    let dateToday, dateMedia;

    // test 1 - standard
    dateToday = new Date(2018, 0, 2, 10, 10, 10);

    dateMedia = new Date(2017, 11, 31, 10, 10, 10);
    output = MediaComposer.seasonDiffDays(dateMedia.getTime(), 0, dateToday.getTime());
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(2);

    dateMedia = new Date(2018,  0,  8, 10, 10, 10);
    output = MediaComposer.seasonDiffDays(dateMedia.getTime(), 0, dateToday.getTime());
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(6);

    // test 2 - shift today
    dateToday = new Date(2018, 0, 5, 10, 10, 10);

    dateMedia = new Date(2017, 11, 31, 10, 10, 10);
    output = MediaComposer.seasonDiffDays(dateMedia.getTime(), -3, dateToday.getTime());
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(2);

    dateMedia = new Date(2018,  0,  8, 10, 10, 10);
    output = MediaComposer.seasonDiffDays(dateMedia.getTime(), -3, dateToday.getTime());
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(6);

    // test 3 - default parameter
    dateToday = new Date();

    dateMedia = new Date(dateToday.getTime() - 1000 * 60 * 60 * 24);
    output = MediaComposer.seasonDiffDays(dateMedia.getTime());
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(1);

    output = MediaComposer.seasonDiffDays(dateMedia.getTime(), -1);
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(0);

    output = MediaComposer.seasonDiffDays(dateMedia.getTime(), 2);
    console.log(`output - ${dateMedia.toLocaleString()} => ${output}`);
    expect(output).toBe(3);
  });

  // .......................................................

  it('evaluateSeasonWeight', () => {

    let time;

    const storeManager = new TestManager();
    const mediaComposer = new MediaComposer();
    mediaComposer.coupleObjects({mediaComposer, storeManager});

    time = new Date(2016, 7, 1, 0, 0, 0).getTime();
    const fileItem = mediaComposer.createFileItem({fileName: '123', rating: 0, time});

    time = new Date(2018, 1, 1, 0, 0, 0).getTime();
    const weight1 = mediaComposer.evaluateSeasonWeight(fileItem, time);

    time = new Date(2017, 1, 1, 0, 0, 0).getTime();
    const weight2 = mediaComposer.evaluateSeasonWeight(fileItem, time);

    time = new Date(2018, 6, 2, 0, 0, 0).getTime();
    const weight3 = mediaComposer.evaluateSeasonWeight(fileItem, time);

    //console.log(`weight1=${weight1}\nweight2=${weight2}\nweight3=${weight3}`);

    expect(weight1).toBe(weight2);
    expect(weight3).toBeLessThan(weight2);
    expect(weight3).toBeGreaterThan(0);

    time = new Date().getTime();
    const weight4 = mediaComposer.evaluateSeasonWeight(fileItem, time);

    const weight5 = mediaComposer.evaluateSeasonWeight(fileItem, null);

    expect(Math.abs(weight4 - weight5)).toBeLessThan(0.1);
    console.log(`weight4=${weight4}\nweight5=${weight5}`);

  });

});
