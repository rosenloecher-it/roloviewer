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




});
