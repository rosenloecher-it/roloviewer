import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";

describe('crawlerReducer', () => {

  it('compareCrawleStates', () => {

    let stateCompare = null;

    const reducer = new CrawlerReducer('test');

    const stateDefault = reducer.reduce(undefined, 'this_special_action_type_should_not_exists!');

    stateDefault.id = 'id1';
    stateDefault._id = '_id1';
    stateDefault.databasePath = 'databasePath1';
    stateDefault.folderBlacklist.push('folderBlacklist1');
    stateDefault.folderBlacklist.push('folderBlacklist2');
    stateDefault.folderBlacklistSnippets.push('folderBlacklistSnippets1');
    stateDefault.folderBlacklistSnippets.push('folderBlacklistSnippets2');
    stateDefault.showRating.push(1);
    stateDefault.showRating.push(2);
    stateDefault.tagBlacklist.push('tagBlacklist1');
    stateDefault.tagBlacklist.push('tagBlacklist2');


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

    stateCompare.folderBlacklist.push('folderBlacklist3');
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    stateDefault.folderBlacklistSnippets.pop();
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    stateDefault.showRating = [ 1, 3 ];
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

    stateCompare = CrawlerReducer.cloneCrawleState(stateDefault);
    stateDefault.tagBlacklist = [];
    expect(CrawlerReducer.compareCrawleStates(stateDefault, stateCompare)).toBe(false);

  });

});
