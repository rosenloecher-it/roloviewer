
import * as actionType from '../actions/actionTypes';

export const toggleMainPageNaviPane = () => ({
  type: actionType.MAINPAGE_TOGGLE_NAVIPANE
})

export const toggleMainPageDetailsPane = () => ({
  type: actionType.MAINPAGE_TOGGLE_DETAILSPANE
})

export const toggleMainPageThumbsPane = () => ({
  type: actionType.MAINPAGE_TOGGLE_THUMBSPANE
})


export const resizeMainPageNaviPane = (newSize) => ({
  type: actionType.MAINPAGE_RESIZE_NAVIPANE,
  newSize
})

export const resizeMainPageDetailsPane = (newSize) => ({
  type: actionType.MAINPAGE_RESIZE_DETAILSPANE,
  newSize
})

export const resizeMainPageThumbsPane = (newSize) => ({
  type: actionType.MAINPAGE_RESIZE_THUMBSPANE,
  newSize
})

