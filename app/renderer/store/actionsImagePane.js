import * as constants from '../../common/constants';

export const goNext = () => ({
  type: constants.ACTION_GO_NEXT
})

export const goBack = () => ({
  type: constants.ACTION_GO_BACK
})

export const showFiles = ({ container, items }) => ({
  type: constants.ACTION_SHOW_FILES,
  container,
  items,
})

