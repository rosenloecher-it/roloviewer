import {MediaLoader} from "../../../app/worker/crawler/mediaLoader";
import * as vali from "../../../app/common/utils/validate";
import {TestManager} from "../../common/store/testManager";
import * as constants from '../../../app/common/constants';
import {MediaFilter} from "../../../app/worker/crawler/mediaFilter";

describe('MediaFilter', () => {

  it('shouldSkipFolder', () => {

    //const mediaLoader = new MediaLoader();

    const folderParent = "/home/data/mymedia/201x/2011/";
    const folderChild = "/home/data/mymedia/201x/2011/20110224-S95-Test";

    expect(MediaFilter.shouldSkipFolder(folderParent, [folderChild], [])).toBe(false);
    expect(MediaFilter.shouldSkipFolder(folderChild, [folderParent], [])).toBe(true);

    expect(MediaFilter.shouldSkipFolder(folderChild, [], [ "s95" ])).toBe(true);
    expect(MediaFilter.shouldSkipFolder(folderChild, [], [ "test" ])).toBe(true);
    expect(MediaFilter.shouldSkipFolder(folderChild, [], [ "notexist" ])).toBe(false);



  });


  it('isImageFormatSupported', () => {

    expect(MediaFilter.isImageFormatSupported('/ggg/1.jpg')).toBe(true);
    expect(MediaFilter.isImageFormatSupported('/ggg/1.Jpg')).toBe(true);
    expect(MediaFilter.isImageFormatSupported('/ggg/1.jPG')).toBe(true);

    expect(MediaFilter.isImageFormatSupported('/ggg/1.doc')).toBe(false);

  });




});
