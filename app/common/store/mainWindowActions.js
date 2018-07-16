import * as constants from "../constants";
import {valiBoolean, valiInt} from "../utils/validate";
import * as configUtils from "../utils/fileUtils";

export const createActionInit = ({
  x, y, height, width,
  fullscreen, maximized,
  activeDevtool,
}) => ({
  type: constants.AR_MAINWINDOW_INIT,
  payload: {
    x, y, height, width,
    fullscreen, maximized,
    activeDevtool,
  }
});

export const createActionSetActiveDevtool = (value) => ({
  type: constants.AR_MAINWINDOW_SET_ACTIVE_DEVTOOL,
  payload: value
});

export const createActionSetFullscreen = (value = false) => ({
  type: constants.AR_MAINWINDOW_SET_FULLSCREEN,
  payload: value
});

export const createActionSetMaximized = (value = false) => ({
  type: constants.AR_MAINWINDOW_SET_MAXIMIZED,
  payload: value
});


