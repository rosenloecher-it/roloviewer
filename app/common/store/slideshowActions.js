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
