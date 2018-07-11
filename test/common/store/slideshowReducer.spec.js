import {SlideshowReducer} from '../../../app/common/store/slideshowReducer';
import * as actions from '../../../app/common/store/slideshowActions';

// ----------------------------------------------------------------------------------

function createDefaultTestState() {
  const slideshowReducer = new SlideshowReducer('createDefaultTestState');
  const state = slideshowReducer.reduce(undefined, { type: "action_name_should_not_exists!!_14e1234"});

  return state;
}

function addItems(state, countNewItems, deliveryKey) {

  for (let i = 0; i < countNewItems; i++) {
    const file = `/abc/${1}`;
    state.items.push({file , deliveryKey});
  }

  return state;
}

// ----------------------------------------------------------------------------------

describe('goto', () => {

  it ('createActionJump', () => {
    let stateOut;
    let action;

    const slideshowReducer = new SlideshowReducer('goto');

    // prepare state
    const stateDefault = createDefaultTestState();

    addItems(stateDefault, 10, 1);
    addItems(stateDefault, 10, 2);
    addItems(stateDefault, 10, 3);
    addItems(stateDefault, 10, 4);

    // section 1
    stateDefault.itemIndex = 16;
    stateDefault.container = "noAutoSelect";
    action = actions.createActionJump(12);
    stateOut = slideshowReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(28);

    action = actions.createActionJump(55);
    stateOut = slideshowReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(39);


    // section 2
    stateDefault.itemIndex = 25;
    stateDefault.container = null;
    action = actions.createActionGoPage(1); // greater than 0
    stateOut = slideshowReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(30);

    action = actions.createActionGoPage(-1); // greater than 0
    stateOut = slideshowReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(19);
  });

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
