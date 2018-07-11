import * as constants from "../constants";

// ----------------------------------------------------------------------------------

export const createItem = (file) => ({
  file
});

// ----------------------------------------------------------------------------------

export const createActionInit = ({
                                   autoPlay,
                                   crawlerInfoPosition,
                                   crawlerInfoShow,
                                   detailsPosition,
                                   detailsState,
                                   lastContainer,
                                   lastContainerType,
                                   lastItem,
                                   random,
                                   screensaver,
                                   timer,
                                   transitionTimeAutoPlay,
                                   transitionTimeManual,
}) => ({
  type: constants.AR_SLIDESHOW_INIT,
  payload: {
    autoPlay,
    crawlerInfoPosition,
    crawlerInfoShow,
    detailsPosition,
    detailsState,
    lastContainer,
    lastContainerType,
    lastItem,
    random,
    screensaver,
    timer,
    transitionTimeAutoPlay,
    transitionTimeManual,
  }
});

export const createActionAddAutoFiles = (items) => ({
  type: constants.AR_SLIDESHOW_ADD_AUTO_FILES,
  payload: {
    container: null,
    containerType: constants.CONTAINER_AUTOSELECT,
    items
  }
});

export const createActionShowFiles = (container, containerType, items, selectItem) => ({
  type: constants.AR_SLIDESHOW_SHOW_CONTAINER_FILES,
  payload: {
    container,
    containerType,
    items,
    selectItem
  }
});

export const createActionDeliverFileMeta = (meta) => ({
  type: constants.AR_SLIDESHOW_DELIVER_META,
  payload: { meta }
});

export const createActionGoNext = () => ({ type: constants.AR_SLIDESHOW_GO_NEXT });
export const createActionGoBack = () => ({ type: constants.AR_SLIDESHOW_GO_BACK });

export const createActionJump = (jumpWidth) => ({
  type: constants.AR_SLIDESHOW_GO_JUMP,
  payload: jumpWidth
});

export const createActionGoPage = (direction) => ({
  type: constants.AR_SLIDESHOW_GO_PAGE,
  payload: direction
});

export const createActionGoPos1 = () => ({ type: constants.AR_SLIDESHOW_GO_POS1 });
export const createActionGoEnd = () => ({ type: constants.AR_SLIDESHOW_GO_END });

export const createActionAutoPlayStart = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_START });
export const createActionAutoPlayStop = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_STOP });
export const createActionToogleAutoPlay = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_TOGGLE });

export const createActionHelpClose = () => ({ type: constants.AR_SLIDESHOW_HELP_CLOSE });
export const createActionHelpToogle = () => ({ type: constants.AR_SLIDESHOW_HELP_TOOGLE });

export const createActionDetailsToogle = () => ({ type: constants.AR_SLIDESHOW_DETAILS_TOOGLE });
export const createActionDetailsMove = () => ({ type: constants.ACTION_DETAILS_MOVE });

export const createActionCursorHide = () => ({ type: constants.AR_SLIDESHOW_CURSOR_HIDE });
export const createActionCursorShow = () => ({ type: constants.AR_SLIDESHOW_CURSOR_SHOW });


export const createActionSetLastItemContainer = (lastContainerType, lastContainer, lastItem) => ({
  type: constants.AR_SLIDESHOW_SET_LAST_ITEM_CONTAINER,
  payload: { lastContainerType, lastContainer, lastItem }
});




