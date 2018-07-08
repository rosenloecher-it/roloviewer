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







export const goNext = () => ({ type: constants.ACTION_GO_NEXT });
export const goBack = () => ({ type: constants.ACTION_GO_BACK });

export const goJump = (jumpWidth) => ({
  type: constants.ACTION_GO_JUMP,
  payload: jumpWidth
});

export const goPage = (direction) => ({
  type: constants.ACTION_GO_PAGE,
  payload: direction
});

export const goPos1 = () => ({ type: constants.ACTION_GO_POS1 });
export const goEnd = () => ({ type: constants.ACTION_GO_END });

export const autoPlayStart = () => ({ type: constants.ACTION_AUTOPLAY_START });
export const autoPlayStop = () => ({ type: constants.ACTION_AUTOPLAY_STOP });
export const toogleAutoPlay = () => ({ type: constants.ACTION_AUTOPLAY_TOGGLE });

export const helpOpen = () => ({ type: constants.ACTION_HELP_OPEN });
export const helpClose = () => ({ type: constants.ACTION_HELP_CLOSE });
export const helpToogle = () => ({ type: constants.ACTION_HELP_TOOGLE });

export const detailsToogle = () => ({ type: constants.ACTION_DETAILS_TOOGLE });
export const detailsMove = () => ({ type: constants.ACTION_DETAILS_MOVE });

export const cursorHide = () => ({ type: constants.ACTION_CURSOR_HIDE });
export const cursorShow = () => ({ type: constants.ACTION_CURSOR_SHOW });
