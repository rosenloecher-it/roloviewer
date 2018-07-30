import {MediaFilter} from "../../../app/worker/crawler/mediaFilter";
import {isWinOs} from "../../../app/common/utils/systemUtils";

describe('MediaFilter', () => {

  it('isFolderBlacklisted(linux)', () => {

    if (isWinOs())
      return;

    //const mediaLoader = new MediaLoader();

    const folderParent = "/home/data/mymedia/201x/2011/";
    const folderChild = "/home/data/mymedia/201x/2011/20110224-S95-Test";

    expect(MediaFilter.isFolderBlacklisted(folderParent, [folderChild], [])).toBe(false);
    expect(MediaFilter.isFolderBlacklisted(folderChild, [folderParent], [])).toBe(true);

    expect(MediaFilter.isFolderBlacklisted(folderChild, [], [ "s95" ])).toBe(true);
    expect(MediaFilter.isFolderBlacklisted(folderChild, [], [ "test" ])).toBe(true);
    expect(MediaFilter.isFolderBlacklisted(folderChild, [], [ "notexist" ])).toBe(false);



  });

  it('isFolderBlacklisted(windows)', () => {

    if (isWinOs())
      return;

    //const mediaLoader = new MediaLoader();

    const folderParent = 'd:\\home\\data\\mymedia\\201x\\2011\\';
    const folderChild = 'd:\\home\\data\\mymedia\\201x\\2011\\20110224-S95-Test';

    expect(MediaFilter.isFolderBlacklisted(folderParent, [folderChild], [])).toBe(false);
    expect(MediaFilter.isFolderBlacklisted(folderChild, [folderParent], [])).toBe(true);

    expect(MediaFilter.isFolderBlacklisted(folderChild, [], [ "s95" ])).toBe(true);
    expect(MediaFilter.isFolderBlacklisted(folderChild, [], [ "test" ])).toBe(true);
    expect(MediaFilter.isFolderBlacklisted(folderChild, [], [ "notexist" ])).toBe(false);



  });

  it('isImageFormatSupported', () => {

    expect(MediaFilter.isImageFormatSupported('/ggg/1.jpg')).toBe(true);
    expect(MediaFilter.isImageFormatSupported('/ggg/1.Jpg')).toBe(true);
    expect(MediaFilter.isImageFormatSupported('/ggg/1.jPG')).toBe(true);

    expect(MediaFilter.isImageFormatSupported('/ggg/1.doc')).toBe(false);

  });


  it('tumbleArray', () => {

    const count = 10;

    const valuesIn = [];
    for (let i = 0; i < count; i++)
      valuesIn.push(i);

    const valuesInClone = valuesIn.slice(0);

    const valuesOut = MediaFilter.tumbleArray(valuesIn);

    expect(valuesIn.length).toBe(count);
    expect(valuesInClone.length).toBe(count);
    expect(valuesOut.length).toBe(count);


    let countEqual = 0;
    let countGreater = 0;
    let countLess = 0;
    let valueLast = 0;

    for (let i = 0; i < count; i++) {
      expect(valuesIn[i]).toBe(valuesInClone[i]);

      if (i > 0) {
        if (valuesOut[i] === valueLast)
          countEqual++;
        if (valuesOut[i] > valueLast)
          countGreater++;
        if (valuesOut[i] < valueLast)
          countLess++;
      }

      valueLast = valuesOut[i];
    }

    console.log('array', valuesOut);
    console.log(`countEqual=${countEqual}; countGreater=${countGreater}; countLess=${countLess}`);


    expect(countEqual).toBe(0);
    expect(countGreater).toBeGreaterThan(1);
    expect(countLess).toBeGreaterThan(1);

  });


});
