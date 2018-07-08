import {MediaLoader} from "../../app/worker/mediaLoader";
import * as vali from "../../app/common/utils/validate";
import {TestProcessConnector} from "./testProcessConnector";
import {ConfigWorker} from "../../app/worker/workerConfig";
import * as constants from '../../app/common/constants';

describe('MediaLoader', () => {

  it('shouldSkipFolder', () => {

    //const mediaLoader = new MediaLoader();

    const folderParent = "/home/data/mymedia/201x/2011/";
    const folderChild = "/home/data/mymedia/201x/2011/20110224-S95-Test";

    // shouldSkipSourceFolder(sourceFolderIn, blacklistFolders, blacklistSnippets)

    expect(MediaLoader.shouldSkipSourceFolder(folderParent, [folderChild], [])).toBe(false);
    expect(MediaLoader.shouldSkipSourceFolder(folderChild, [folderParent], [])).toBe(true);

    expect(MediaLoader.shouldSkipSourceFolder(folderChild, [], [ "s95" ])).toBe(true);
    expect(MediaLoader.shouldSkipSourceFolder(folderChild, [], [ "test" ])).toBe(true);
    expect(MediaLoader.shouldSkipSourceFolder(folderChild, [], [ "notexist" ])).toBe(false);



  });


  it('isImageFormatSupported', () => {

    expect(MediaLoader.isImageFormatSupported('/ggg/1.jpg')).toBe(true);
    expect(MediaLoader.isImageFormatSupported('/ggg/1.Jpg')).toBe(true);
    expect(MediaLoader.isImageFormatSupported('/ggg/1.jPG')).toBe(true);

    expect(MediaLoader.isImageFormatSupported('/ggg/1.doc')).toBe(false);

  });



  it('listImageFolderRecursive', () => {

    //const mediaLoader = new MediaLoader();
    const sourceFolderIn = [ "/home/data/mymedia/201x" ];
    const blacklistFoldersIn = [ "/home/data/mymedia/201x/2011/20110224-S95-Test" ];
    const blacklistSnippetsIn = [ "Haus " ];

    const sourceFolders = vali.validateFolderArray(sourceFolderIn);
    const blacklistFolders = vali.validateFolderArray(blacklistFoldersIn);
    const blacklistSnippets = vali.validateBlacklistSnippets(blacklistSnippetsIn);

    const minCountJpg = 15;

    const searchFolders = MediaLoader.listImageFolderRecursive(sourceFolders, blacklistFolders, blacklistSnippets, minCountJpg);

    expect(searchFolders.length).toBeGreaterThan(0);

    console.log("searchFolders", searchFolders);

    // TODO change after implementation database version


  });

  it('openAutoSelect - simple mode', () => {

    const config = new ConfigWorker();
    const connector = new TestProcessConnector();

    expect(config.crawlerBatchCount).toBe(constants.DEFCONF_CRAWLER_BATCHCOUNT);

    config.crawlerFolderSource = [ "/home/data/mymedia/201x/2011" ];

    console.log(`config.crawlerBlacklistFolders`, config.crawlerFolderBlacklist);
    console.log(`config.crawlerBlacklistSnippets`, config.crawlerFolderBlacklistSnippets);
    console.log(`config.crawlerBatchCount`, config.crawlerBatchCount);

    const mediaLoader = new MediaLoader();
    mediaLoader.coupleObjects({ config, processConnector: connector });
    // init not needed at moment

    mediaLoader.openAutoSelect();
    //mediaLoader.open("/home/data/mymedia/201x/2018/20180401_ostern");
    //mediaLoader.open({ container: "/home/data/mymedia/201x/2018/20180401_ostern" });

    console.log(`connector.messages`, connector.messages);

    expect(connector.messages.length).toBeGreaterThan(0);




  });


  it('selectRandomItems', () => {

    const maxValue = 300;
    const selectionCount = 50;

    const source = Array(maxValue).fill(0);
    for (let i = 0; i < source.length; i++)
      source[i] = i;

    //console.log("source", source);

    const destination = MediaLoader.selectRandomItems(source, selectionCount);

    //console.log("destination", destination);

    let countMultipleSelections = 0;
    let countUndefined = 0;
    const check = Array(maxValue).fill(0);

    for (let i = 0; i < destination.length; i++) {
      const value = destination[i];

      if (typeof(value) === typeof(0)) {
        if (value >= 0 && value < maxValue)
          check[ value ] += 1;
        else
          countUndefined++;
      } else
        countUndefined++;
    }

    // console.log("check", check);
    // console.log("countUndefined", countUndefined);

    for (let i = 0; i < check.length; i++) {
      if (check[i] > 1)
        countMultipleSelections++;
    }

    //console.log("countMultipleSelections", countMultipleSelections);

    expect(destination.length).toBe(selectionCount);
    expect(countUndefined).toBe(0);
    expect(countMultipleSelections).toBe(0);

  });





  // it('test random', () => {
  //   const max = 10;
  //   const array = Array(max).fill(0);
  //   for (let i = 0; i < 100; i++) {
  //     const random = Math.floor(max * Math.random());
  //     console.log("random", random);
  //     array[random] += 1;
  //   }
  //   console.log("array", array);
  // });

});
