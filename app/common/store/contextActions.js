import * as constants from "../constants";

export const createActionInit = ({
  isDevelopment, isDevTool, isProduction, isTest,
  configIsReadOnly, defaultConfigFile, configFile
}) => ({
  type: constants.AR_CONTEXT_INIT,
  payload: {
    isDevelopment, isDevTool, isProduction, isTest,
    configIsReadOnly, defaultConfigFile, configFile
  }
});
