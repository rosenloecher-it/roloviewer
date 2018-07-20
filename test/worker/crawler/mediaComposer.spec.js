import * as constants from '../../../app/common/constants';
import * as stringUtils from "../../../app/common/utils/stringUtils";
import {MediaComposer} from "../../../app/worker/crawler/mediaComposer";

// ----------------------------------------------------------------------------------

function checkRandomWeight(disposer, countTest) {

  console.log(`checkRandomWeight(${countTest})`);

  let sum = 0;
  let max = 0;
  let min = constants.CRAWLER_MAX_WEIGHT;;

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

function checkRandomSelectFilesFromDir(disposer, countFiles, countSelectDemanded) {

  console.log(`checkRandomSelectFilesFromDir(countFiles=${countFiles}, countSelectDemanded=${countSelectDemanded})`);
  // prepare
  const dir = {
    fileItems: []
  };

  for (let i = 0; i < countFiles; i++) {
    const fileName = stringUtils.randomString(10);
    const item = disposer.createFileItem({
      fileName,
      weight: i, // no extra evaluateFileItem necessary
    });

    dir.fileItems.push(item);
  }

  disposer.evaluateDir(dir);

  // start test

  const selections = disposer.randomSelectFilesFromDir(dir, countSelectDemanded);

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
  //expect(min).toBeGreaterThanOrEqual(0); TODO

  expect(averageNorm).toBeGreaterThan(0);

  if (selections.length >= 8 && selections.length > 2 * countSelectDemanded) {
    expect(averageNorm).toBeLessThan(0.4);
  }

}

// ----------------------------------------------------------------------------------

describe('mediaWeigher', () => {

  it('randomWeighted', () => {

    const disposer = new MediaComposer();

    checkRandomWeight(disposer, 20);

    checkRandomWeight(disposer, 2);

    expect(disposer.randomWeighted(null)).toBe(null);
    expect(disposer.randomWeighted(0)).toBe(null);

    for (let i = 0; i < 3; i++)
      expect(disposer.randomWeighted(1)).toBe(0);

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

  it('evaluateFileItem', () => {

    const disposer = new MediaComposer();

    const item1 = disposer.createFileItem({ fileName: stringUtils.randomString(10) });
    const item2 = disposer.createFileItem({ fileName: stringUtils.randomString(10) });

    item1.lastShown = new Date().getTime();
    item2.lastShown = item1.lastShown + 1 * 24 * 60 * 60 * 1000 * 60; // plus 1 day

    item1.rating = 0;
    item2.rating = 0;

    disposer.evaluateFileItem(item1);
    disposer.evaluateFileItem(item2);

    expect(item1.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);
    expect(item2.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    expect(item2.weight).toBeGreaterThan(item1.weight);

    item2.rating = 2;
    disposer.evaluateFileItem(item2);

    expect(item1.weight).toBeGreaterThan(item2.weight);
  });

  // .......................................................

  it('evaluateDir', () => {

    const countFiles = 30;
    const countSelect = 10;

    const disposer = new MediaComposer();

    // prepare
    const dir = {
      fileItems: []
    };

    for (let i = 0; i < countFiles; i++) {
      const item = disposer.createFileItem({
        fileName: stringUtils.randomString(10),
        weight: countFiles - i, // => re-sort necessary, no extra evaluateFileItem necessary
      });

      dir.fileItems.push(item);
    }

    disposer.evaluateDir(dir);

    expect(dir.weight).toBeLessThan(constants.CRAWLER_MAX_WEIGHT);

    let lastWeight = 0;
    for (let i = 0; i < countFiles; i++) {
      const fileItem = dir.fileItems[i];
      if (i > 0)
        expect(fileItem.weight).toBeGreaterThanOrEqual(lastWeight);
      lastWeight = fileItem.weight;
    }

    //console.log('evaluateDir', dir);

    dir.fileItems = [];
    disposer.evaluateDir(dir);
    expect(dir.weight).toBe(constants.CRAWLER_MAX_WEIGHT);

  });

  // .......................................................

  it('randomSelectFilesFromDir', () => {

    const disposer = new MediaComposer();

    checkRandomSelectFilesFromDir(disposer, 30, 10);
    checkRandomSelectFilesFromDir(disposer, 10, 10);
    checkRandomSelectFilesFromDir(disposer, 4, 6);


  });


});
