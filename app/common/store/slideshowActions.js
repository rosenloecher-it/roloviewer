import * as constants from "../constants";

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
                                   pathShortenElements,
                                   random,
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
    pathShortenElements,
    random,
    timer,
    transitionTimeAutoPlay,
    transitionTimeManual,
  }
});

export const createActionAutoPlayStart = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_START });
export const createActionAutoPlayStop = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_STOP });
export const createActionToogleAutoPlay = () => ({ type: constants.AR_SLIDESHOW_AUTOPLAY_TOGGLE });

export const createActionDetailsToogle = () => ({ type: constants.AR_SLIDESHOW_DETAILS_TOOGLE });
export const createActionDetailsMove = () => ({ type: constants.AR_SLIDESHOW_DETAILS_MOVE });

export const createActionCrawlerInfoToogle = () => ({ type: constants.AR_SLIDESHOW_CRAWLERINFO_TOOGLE });
export const createActionCrawlerInfoMove = () => ({ type: constants.AR_SLIDESHOW_CRAWLERINFO_MOVE });

export const createActionSetLastItemContainer = (lastContainerType, lastContainer, lastItem) => ({
  type: constants.AR_SLIDESHOW_SET_LAST_ITEM_CONTAINER,
  payload: { lastContainerType, lastContainer, lastItem }
});




