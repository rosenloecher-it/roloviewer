import * as constants from "../constants";

export const createActionInitReducer = ({
  exiftool, lastDialogFolder,
  logfile, logLevelConsole, logLevelFile,
  mapUrlFormat, powerSaveBlockTime
}) => ({
  type: constants.AR_SYSTEM_INIT_REDUCER,
  payload: {
    exiftool, lastDialogFolder,
    logfile, logLevelConsole, logLevelFile,
    mapUrlFormat, powerSaveBlockTime
  }
});

export const createActionSetLastDialogFolder = (folder) => ({
  type: constants.AR_SYSTEM_SET_LAST_DIALOG_FOLDER,
  payload: folder
});


