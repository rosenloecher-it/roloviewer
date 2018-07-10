import * as constants from "../constants";

export const createActionInit = ({
  exiftool,
  logfile, logLevelConsole, logLevelFile,
  powerSaveBlockTime
}) => ({
  type: constants.AR_SYSTEM_INIT,
  payload: {
    exiftool,
    logfile, logLevelConsole, logLevelFile,
    powerSaveBlockTime
  }
});

export const createActionSetLastDialogFolder = (folder) => ({
  type: constants.AR_SYSTEM_SET_LAST_DIALOG_FOLDER,
  payload: folder
});

