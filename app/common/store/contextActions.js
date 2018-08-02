import * as constants from "../constants";

export const createActionInitReducer = ({
  isDevelopment, isDevtool, isProduction, isTest, isScreensaver,
  configFile, configIsReadOnly, exePath,
  tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer,
  versionElectron
}) => ({
  type: constants.AR_CONTEXT_INIT_REDUCER,
  payload: {
    isDevelopment, isDevtool, isProduction, isTest, isScreensaver,
    configIsReadOnly, configFile, exePath,
    tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer,
    versionElectron
  }
});

export const createActionSetVersionExifReader = (versionExifReader) => ({
  type: constants.AR_CONTEXT_SET_VERSION_EXIFREADER,
  payload: versionExifReader
});





