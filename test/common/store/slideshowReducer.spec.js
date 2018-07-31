import {SlideshowReducer} from '../../../app/common/store/slideshowReducer';

// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------

describe('goto', () => {

  it ('detailsState', () => {
    let textIn, textOut;

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
