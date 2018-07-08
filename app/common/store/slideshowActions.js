import * as constants from "../constants";


export const createItem = (file) => ({
  file
});

export const createActionAddAutoFiles = (items) => ({
  type: constants.ACTION_ADD_AUTO_FILES,
  payload: {
    container: null,
    containerType: constants.CONTAINER_AUTOSELECT,
    items
  }
});

export const createActionShowFiles = (container, containerType, items, selectItem) => ({
  type: constants.ACTION_SHOW_CONTAINER_FILES,
  payload: {
    container,
    containerType,
    items,
    selectItem
  }
});

export const createActionDeliverFileMeta = (meta) => ({
  type: constants.ACTION_DELIVER_FILE_META,
  payload: { meta }
});

export const createActionGoNext = () => ({ type: constants.ACTION_GO_NEXT });
export const createActionGoBack = () => ({ type: constants.ACTION_GO_BACK });

export const createActionJump = (jumpWidth) => ({
  type: constants.ACTION_GO_JUMP,
  payload: jumpWidth
});

export const createActionGoPage = (direction) => ({
  type: constants.ACTION_GO_PAGE,
  payload: direction
});

export const createActionGoPos1 = () => ({ type: constants.ACTION_GO_POS1 });
export const createActionGoEnd = () => ({ type: constants.ACTION_GO_END });

export const createActionAutoPlayStart = () => ({ type: constants.ACTION_AUTOPLAY_START });
export const createActionAutoPlayStop = () => ({ type: constants.ACTION_AUTOPLAY_STOP });
export const createActionToogleAutoPlay = () => ({ type: constants.ACTION_AUTOPLAY_TOGGLE });

export const createActionHelpOpen = () => ({ type: constants.ACTION_HELP_OPEN });
export const createActionHelpClose = () => ({ type: constants.ACTION_HELP_CLOSE });
export const createActionHelpToogle = () => ({ type: constants.ACTION_HELP_TOOGLE });

export const createActionDetailsToogle = () => ({ type: constants.ACTION_DETAILS_TOOGLE });
export const createActionDetailsMove = () => ({ type: constants.ACTION_DETAILS_MOVE });

export const createActionCursorHide = () => ({ type: constants.ACTION_CURSOR_HIDE });
export const createActionCursorShow = () => ({ type: constants.ACTION_CURSOR_SHOW });
