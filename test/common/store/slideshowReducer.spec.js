import {SlideshowReducer} from '../../../app/common/store/slideshowReducer';
import * as slideshowActions from '../../../app/common/store/slideshowActions';

// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------

describe('goto', () => {

  it ('detailsState', () => {
    let stateOut;
    let textIn, textOut;
    let action;

    textOut = SlideshowReducer.getValidDetailsState(null, false);
    expect(!!textOut).toBe(true);

    for (let i = 0; i < 10; i++) {
      textIn = textOut;
      textOut = SlideshowReducer.getValidDetailsState(textIn, true);
      expect(!!textOut).toBe(true);
      expect(textOut).not.toBe(textIn);
    }

  });
});
