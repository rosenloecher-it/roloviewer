import * as constants from "../constants";

// ----------------------------------------------------------------------------------

export const createActionInit = ({
   batchCount, databasePath,
   folderBlacklist, folderBlacklistSnippets, folderSource,
   maxFilesPerFolder, showRating, tagBlacklist, tagShow, updateDirsAfterMinutes,
   weightingRating, weightingRepeated, weightingSeason, weightingSelPow,
}) => ({
  type: constants.AR_WORKER_INIT,
  payload: {
    batchCount, databasePath,
    folderBlacklist, folderBlacklistSnippets, folderSource,
    maxFilesPerFolder, showRating, tagBlacklist, tagShow, updateDirsAfterMinutes,
    weightingRating, weightingRepeated, weightingSeason, weightingSelPow,
  }
});

