import * as constants from "../constants";

export const createActionInit = ({
  isDevelopment, isDevtool, isProduction, isTest, isScreensaver,
  configFile, configIsReadOnly,
  tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer
}) => ({
  type: constants.AR_CONTEXT_INIT,
  payload: {
    isDevelopment, isDevtool, isProduction, isTest, isScreensaver,
    configIsReadOnly, configFile,
    tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer
  }
});






