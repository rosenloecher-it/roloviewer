import path from 'path';
import * as constants from '../constants';

// ----------------------------------------------------------------------------------

export const createActionInitReducer = ({
  batchCount,
  blacklistFolders,
  blacklistFolderSnippets,
  blacklistTags,
  databasePath,
  showRatings,
  showTags,
  sourceFolders,
  updateDirsAfterMinutes,
  weightingRating,
  weightingRepeated,
  weightingSeason,
  weightingSelPow,
}) => {

  for (let i = 0; i < blacklistFolders.length; i++)
    blacklistFolders[i] = path.normalize(blacklistFolders[i]);
  for (let i = 0; i < sourceFolders.length; i++)
    sourceFolders[i] = path.normalize(sourceFolders[i]);

  return {
    type: constants.AR_CRAWLER_INIT_REDUCER,
    payload: {
      batchCount,
      blacklistFolders,
      blacklistFolderSnippets,
      blacklistTags,
      databasePath,
      showRatings,
      showTags,
      sourceFolders,
      updateDirsAfterMinutes,
      weightingRating,
      weightingRepeated,
      weightingSeason,
      weightingSelPow,
    }
  }
};

export const createActionSetSourceFolders = values => ({
  type: constants.AR_CRAWLER_SOURCE_FOLDERS,
  payload: values
});
