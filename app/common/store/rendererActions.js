import * as constants from "../constants";

// ----------------------------------------------------------------------------------

export const createMediaItem = (file) => ({
  file
});

// ----------------------------------------------------------------------------------

export function createMediaItems(files) {
  const items = [];
  for (let i = 0; i < files.length; i++) {
    const item = createMediaItem(files[i]);
    if (item)
      items.push(item);
  }
  return items;
};

// ----------------------------------------------------------------------------------

export const createActionAddAutoFiles = (items) => ({
  type: constants.AR_RENDERER_ADD_AUTO_FILES,
  payload: {
    container: null,
    containerType: constants.CONTAINER_AUTOSELECT,
    items
  }
});

export const createActionShowFiles = (container, containerType, items, selectItem) => ({
  type: constants.AR_RENDERER_SHOW_CONTAINER_FILES,
  payload: {
    container,
    containerType,
    items,
    selectItem
  }
});

export const createActionDeliverFileMeta = (meta) => ({
  type: constants.AR_RENDERER_DELIVER_META,
  payload: { meta }
});

export const createActionGoNext = () => ({ type: constants.AR_RENDERER_GO_NEXT });
export const createActionGoBack = () => ({ type: constants.AR_RENDERER_GO_BACK });

export const createActionJump = (jumpWidth) => ({
  type: constants.AR_RENDERER_GO_JUMP,
  payload: jumpWidth
});

export const createActionGoPage = (direction) => ({
  type: constants.AR_RENDERER_GO_PAGE,
  payload: direction
});

export const createActionGoPos1 = () => ({ type: constants.AR_RENDERER_GO_POS1 });
export const createActionGoEnd = () => ({ type: constants.AR_RENDERER_GO_END });

export const createActionAutoPlayStart = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_START });
export const createActionAutoPlayStop = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_STOP });
export const createActionToogleAutoPlay = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_TOGGLE });

export const createActionAboutOpen = () => ({ type: constants.AR_RENDERER_ABOUT_OPEN });
export const createActionAboutClose = () => ({ type: constants.AR_RENDERER_ABOUT_CLOSE });

export const createActionHelpClose = () => ({ type: constants.AR_RENDERER_HELP_CLOSE });
export const createActionHelpToogle = () => ({ type: constants.AR_RENDERER_HELP_TOOGLE });

export const createActionCursorHide = () => ({ type: constants.AR_RENDERER_CURSOR_HIDE });
export const createActionCursorShow = () => ({ type: constants.AR_RENDERER_CURSOR_SHOW });




