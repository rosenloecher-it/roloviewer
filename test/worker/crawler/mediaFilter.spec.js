import { MediaFilter } from '../../../app/worker/crawler/mediaFilter';
import { isWinOs } from '../../../app/common/utils/systemUtils';

describe('MediaFilter', () => {
  it('isFolderInside(linux)', () => {
    if (isWinOs()) return;

    const sourceFolders = [
      '/home/data/mymedia/201x/201dd',
      '/home/data/mymedia/201x/201d2/'
    ];

    let folder;

    folder = '/home/data/mymedia/201x/2014/20141015 Sammelsurium';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);

    folder = '/home/data/mymedia/201x/201dd ';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);

    folder = '/home/data/mymedia/201x/201d2/inside';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(true);

    folder = '/home/data/mymedia/201x/201d2 /inside';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);

    folder = '/home/data/mymedia/201x/201dd /inside';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);
  });

  it('isFolderInside(windows)', () => {
    if (!isWinOs()) return;

    const sourceFolders = [
      'd:\\home\\data\\mymedia\\201x\\201dd',
      'd:\\home\\data\\mymedia\\201x\\201d2\\'
    ];

    let folder;

    folder = 'd:\\home\\data\\mymedia\\201x\\2014\\20141015 Sammelsurium';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);

    folder = 'd:\\home\\data\\mymedia\\201x\\201dd ';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);

    folder = 'd:\\home\\data\\mymedia\\201x\\201d2\\inside';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(true);

    folder = 'd:\\home\\data\\mymedia\\201x\\201d2 \\inside';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);

    folder = 'd:\\home\\data\\mymedia\\201x\\201dd \\inside';
    expect(MediaFilter.isFolderInside(folder, sourceFolders)).toBe(false);
  });

  it('isFolderBlacklisted(linux)', () => {
    if (isWinOs()) return;

    let blacklisted;

    const folderParent = '/home/data/mymedia/201x/2011/';
    const folderChild = '/home/data/mymedia/201x/2011/20110224-S95-Test';

    blacklisted = MediaFilter.isFolderBlacklisted(
      folderParent,
      [folderChild],
      []
    );
    expect(blacklisted).toBe(false);
    blacklisted = MediaFilter.isFolderBlacklisted(
      folderChild,
      [folderParent],
      []
    );
    expect(blacklisted).toBe(true);

    blacklisted = MediaFilter.isFolderBlacklisted(folderChild, [], ['s95']);
    expect(blacklisted).toBe(true);
    blacklisted = MediaFilter.isFolderBlacklisted(folderChild, [], ['test']);
    expect(blacklisted).toBe(true);
    blacklisted = MediaFilter.isFolderBlacklisted(
      folderChild,
      [],
      ['notexist']
    );
    expect(blacklisted).toBe(false);
  });

  it('isFolderBlacklisted(windows)', () => {
    if (!isWinOs()) return;

    let blacklisted;

    const folderParent = 'd:\\home\\data\\mymedia\\201x\\2011\\';
    const folderChild =
      'd:\\home\\data\\mymedia\\201x\\2011\\20110224-S95-Test';

    blacklisted = MediaFilter.isFolderBlacklisted(
      folderParent,
      [folderChild],
      []
    );
    expect(blacklisted).toBe(false);
    blacklisted = MediaFilter.isFolderBlacklisted(
      folderChild,
      [folderParent],
      []
    );
    expect(blacklisted).toBe(true);

    blacklisted = MediaFilter.isFolderBlacklisted(folderChild, [], ['s95']);
    expect(blacklisted).toBe(true);
    blacklisted = MediaFilter.isFolderBlacklisted(folderChild, [], ['test']);
    expect(blacklisted).toBe(true);
    blacklisted = MediaFilter.isFolderBlacklisted(
      folderChild,
      [],
      ['notexist']
    );
    expect(blacklisted).toBe(false);
  });


  it('containsTags', () => {

    let result;

    result = MediaFilter.containsTags(['tag1', 'tag2'], ['bLACKList']);
    expect(result).toBe(false);

    result = MediaFilter.containsTags(['tag1', 'tag2', 'BlackList'], ['bLACKList']);
    expect(result).toBe(true);

    result = MediaFilter.containsTags(['tag1', 'tag2', 'BlackList'], ['tagX', 'tagY', 'bLACKList']);
    expect(result).toBe(true);

    result = MediaFilter.containsTags(null, null);
    expect(result).toBe(false);

    result = MediaFilter.containsTags([], []);
    expect(result).toBe(false);

    result = MediaFilter.containsTags(['tag'], []);
    expect(result).toBe(false);

    result = MediaFilter.containsTags([], ['tag']);
    expect(result).toBe(false);
  });


  it('filterRating', () => {

    let result;

    result = MediaFilter.filterRating(null, 1);
    expect(result).toBe(false);

    result = MediaFilter.filterRating([], 1);
    expect(result).toBe(false);

    result = MediaFilter.filterRating([0, 3, 4, 5], 1);
    expect(result).toBe(true);

    result = MediaFilter.filterRating([0, 3, 4, 5], 5);
    expect(result).toBe(false);

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
    for (let i = 0; i < count; i++) valuesIn.push(i);

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
        if (valuesOut[i] === valueLast) countEqual++;
        if (valuesOut[i] > valueLast) countGreater++;
        if (valuesOut[i] < valueLast) countLess++;
      }

      valueLast = valuesOut[i];
    }

    console.log('array', valuesOut);
    console.log(
      `countEqual=${countEqual}; countGreater=${countGreater}; countLess=${countLess}`
    );

    expect(countEqual).toBe(0);
    expect(countGreater).toBeGreaterThan(1);
    expect(countLess).toBeGreaterThan(1);
  });
});
