import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";

describe('crawlerReducer', () => {

  it('compareCrawleStates', () => {

    let stateCompare = null;

    const reducer = new CrawlerReducer('test');

    const stateDefault = reducer.reduce(undefined, 'this_special_action_type_should_not_exists!');

    stateDefault.id = 'id1';
    stateDefault._id = '_id1';
    stateDefault.databasePath = 'databasePath1';
    stateDefault.blacklistFolders.push('folderBlacklist1');
    stateDefault.blacklistFolders.push('folderBlacklist2');
    stateDefault.blacklistFolderSnippets.push('blacklistFolderSnippets1');
    stateDefault.blacklistFolderSnippets.push('blacklistFolderSnippets2');
    stateDefault.showRatings.push(1);
    stateDefault.showRatings.push(2);
    stateDefault.blacklistTags.push('blacklistTag1');
    stateDefault.blacklistTags.push('blacklistTag2');


    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateDefault)).toBe(true);
    expect(CrawlerReducer.compareCrawleStates(null, stateDefault)).toBe(false);
    expect(CrawlerReducer.compareCrawleStates(stateDefault, null)).toBe(false);
    expect(CrawlerReducer.compareCrawleStates(null, null)).toBe(true);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(true);

    stateCompare.id = 'id2';
    stateCompare._id = '_id2';
    stateCompare.databasePath = 'databasePath2';
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(true);

    stateCompare.blacklistFolders.push('folderBlacklist3');
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    stateDefault.blacklistFolderSnippets.pop();
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    stateDefault.showRatings = [ 1, 3 ];
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    stateDefault.blacklistTags = [];
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

  });

});
