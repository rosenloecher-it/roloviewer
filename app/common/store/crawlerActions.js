import * as constants from "../constants";

// ----------------------------------------------------------------------------------

export const createActionInit = ({
  batchCount, databasePath,
  folderBlacklist, folderBlacklistSnippets, folderSource,
  showRating, tagBlacklist, tagShow,
  }) => ({
  type: constants.AR_CRAWLER_INIT,
  payload: {
    batchCount, databasePath,
    folderBlacklist, folderBlacklistSnippets, folderSource,
    showRating, tagBlacklist, tagShow,
  }
});

