import * as constants from "../constants";

export const createActionInitReducer = ({
  exiftool, lastDialogFolder,
  logfile, logLevel,
  mapUrlFormat, powerSaveBlockMinutes
}) => ({
  type: constants.AR_SYSTEM_INIT_REDUCER,
  payload: {
    exiftool, lastDialogFolder,
    logfile, logLevel,
    mapUrlFormat, powerSaveBlockMinutes
  }
});

export const createActionSetLastDialogFolder = (folder) => ({
  type: constants.AR_SYSTEM_SET_LAST_DIALOG_FOLDER,
  payload: folder
});


