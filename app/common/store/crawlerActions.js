import path from 'path';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

export const createActionInitReducer = ({
  batchCount,
  databasePath,
  folderBlacklist,
  folderBlacklistSnippets,
  folderSource,
  maxItemsPerContainer,
  showRating,
  tagBlacklist,
  tagShow,
  updateDirsAfterMinutes,
  weightingRating,
  weightingRepeated,
  weightingSeason,
  weightingSelPow
}) => {

  for (let i = 0; i < folderBlacklist.length; i++)
    folderBlacklist[i] = path.normalize(folderBlacklist[i]);
  for (let i = 0; i < folderSource.length; i++)
    folderSource[i] = path.normalize(folderSource[i]);

  return {
    type: constants.AR_CRAWLER_INIT_REDUCER,
    payload: {
      batchCount,
      databasePath,
      folderBlacklist,
      folderBlacklistSnippets,
      folderSource,
      maxItemsPerContainer,
      showRating,
      tagBlacklist,
      tagShow,
      updateDirsAfterMinutes,
      weightingRating,
      weightingRepeated,
      weightingSeason,
      weightingSelPow
    }
  }
};

export const createActionSetSourceFolders = values => ({
  type: constants.AR_CRAWLER_SOURCE_FOLDERS,
  payload: values
});
