import * as constants from "../constants";

export const createActionInit = ({
  isDevelopment, isDevtool, isProduction, isTest,
  configFile, configIsReadOnly,
  tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer, tempCliScreensaver
}) => ({
  type: constants.AR_CONTEXT_INIT,
  payload: {
    isDevelopment, isDevtool, isProduction, isTest,
    configIsReadOnly, configFile,
    tempCliAutoplay, tempCliAutoselect, tempCliFullscreen, tempCliOpenContainer, tempCliScreensaver
  }
});






