import * as constants from '../../common/constants';

export const goNext = () => ({
  type: constants.ACTION_GO_NEXT
})

export const goBack = () => ({
  type: constants.ACTION_GO_BACK
})

export const newFiles = ({ type, container, items }) => ({
  type,
  container,
  items,
})

