import * as constants from "../constants";

// ----------------------------------------------------------------------------------

export const createActionInitReducer = ({
   batchCount, databasePath,
   folderBlacklist, folderBlacklistSnippets, folderSource,
   maxFilesPerFolder, showRating, tagBlacklist, tagShow, updateDirsAfterMinutes,
   weightingRating, weightingRepeated, weightingSeason, weightingSelPow,
}) => ({
  type: constants.AR_WORKER_INIT_REDUCER,
  payload: {
    batchCount, databasePath,
    folderBlacklist, folderBlacklistSnippets, folderSource,
    maxFilesPerFolder, showRating, tagBlacklist, tagShow, updateDirsAfterMinutes,
    weightingRating, weightingRepeated, weightingSeason, weightingSelPow,
  }
});

