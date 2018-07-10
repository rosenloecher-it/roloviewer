import * as constants from "../constants";

export const createActionInit = ({
  batchCount, database,
  folderBlacklist, folderBlacklistSnippets, folderSource,
  showRating, tagBlacklist, tagShow,
  }) => ({
  type: constants.AR_CRAWLER_INIT,
  payload: {
    batchCount, database,
    folderBlacklist, folderBlacklistSnippets, folderSource,
    showRating, tagBlacklist, tagShow,
  }
});


export const createActionOpen = (container = null, selectFile = null) => ({
  type: constants.AR_CRAWLER_OPEN,
  payload: {
    container, // null == autoSelect
    selectFile
  }
});
