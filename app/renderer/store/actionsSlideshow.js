import * as constants from '../../common/constants';

export const goNext = () => ({
  type: constants.ACTION_GO_NEXT
});

export const goBack = () => ({
  type: constants.ACTION_GO_BACK
});

export const goPageNext = () => ({
  type: constants.ACTION_GO_PAGE_NEXT
});

export const goPageBack = () => ({
  type: constants.ACTION_GO_PAGE_BACK
});

export const goPos1 = () => ({
  type: constants.ACTION_GO_POS1
});

export const goEnd = () => ({
  type: constants.ACTION_GO_END
});

export const toogleAutoPlay = () => ({
  type: constants.ACTION_TOGGLE_AUTOPLAY
});

export const genericAction = ({ type, payload }) => ({
  type,
  payload
});


export const helpOpen = () => ({
  type: constants.ACTION_HELP_OPEN
});

export const helpClose = () => ({
  type: constants.ACTION_HELP_CLOSE
});

export const helpToogle = () => ({
  type: constants.ACTION_HELP_TOOGLE
});

export const detailsToogle = () => ({
  type: constants.ACTION_DETAILS_TOOGLE
});

export const detailsMove = () => ({
  type: constants.ACTION_DETAILS_MOVE
});

export const cursorHide = () => ({
  type: constants.ACTION_CURSOR_HIDE
});

export const cursorShow = () => ({
  type: constants.ACTION_CURSOR_SHOW
});

export const addMeta = (meta) => ({
  type: constants.ACTION_DELIVER_FILE_META,
  payload: { meta }
});


