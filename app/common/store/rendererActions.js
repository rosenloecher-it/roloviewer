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

export const createActionAddAutoFiles = (items, removeOldItems = false) => ({
  type: constants.AR_RENDERER_ADD_AUTO_FILES,
  payload: {
    container: null,
    containerType: constants.CONTAINER_AUTOSELECT,
    items,
    removeOldItems
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

export const createActionGoNext = (triggeredByAutoplay = false) => ({
  type: constants.AR_RENDERER_GO_NEXT,
  payload: triggeredByAutoplay
});

export const createActionGoBack = () => ({ type: constants.AR_RENDERER_GO_BACK });

export const createActionGoRandom = (triggeredByAutoplay = false) => ({
  type: constants.AR_RENDERER_GO_RANDOM,
  payload: triggeredByAutoplay
});

export const createActionGoNoWhere = () => ({ type: constants.AR_RENDERER_GO_NOWHERE });

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

export const createActionCursorHide = () => ({ type: constants.AR_RENDERER_CURSOR_HIDE });
export const createActionCursorShow = () => ({ type: constants.AR_RENDERER_CURSOR_SHOW });




