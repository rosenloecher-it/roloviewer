import {MediaLoader} from "../../../app/worker/crawler/mediaLoader";
import * as vali from "../../../app/common/utils/validate";
import {TestManager} from "../../common/store/testManager";
import * as constants from '../../../app/common/constants';
import {MediaFilter} from "../../../app/worker/crawler/mediaFilter";

describe('MediaLoader', () => {

  it('listImageFolderRecursive', () => {

    //const mediaLoader = new MediaLoader();
    const sourceFolderIn = [ "/home/data/mymedia/201x" ];
    const blacklistFoldersIn = [ "/home/data/mymedia/201x/2011/20110224-S95-Test" ];
    const blacklistSnippetsIn = [ "Haus " ];

    const sourceFolders = vali.valiFolderArray(sourceFolderIn);
    const blacklistFolders = vali.valiFolderArray(blacklistFoldersIn);
    const blacklistSnippets = vali.valiBlacklistSnippets(blacklistSnippetsIn);

    const minCountJpg = 15;

    const searchFolders = MediaLoader.listImageFolderRecursive(sourceFolders, blacklistFolders, blacklistSnippets, minCountJpg);

    expect(searchFolders.length).toBeGreaterThan(0);

    console.log("searchFolders", searchFolders);

    // TODO change after implementation database version


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
