import {RendererReducer} from '../../../app/common/store/rendererReducer';
import * as slideshowActions from '../../../app/common/store/rendererActions';

// ----------------------------------------------------------------------------------

function createDefaultTestState() {
  const rendererReducer = new RendererReducer('createDefaultTestState');
  const state = rendererReducer.reduce(undefined, { type: "action_name_should_not_exists!!_14e1234"});

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

    const rendererReducer = new RendererReducer('goto');

    // prepare state
    const stateDefault = createDefaultTestState();

    addItems(stateDefault, 10, 1);
    addItems(stateDefault, 10, 2);
    addItems(stateDefault, 10, 3);
    addItems(stateDefault, 10, 4);

    // section 1
    stateDefault.itemIndex = 16;
    stateDefault.container = "noAutoSelect";
    action = slideshowActions.createActionJump(12);
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(28);

    action = slideshowActions.createActionJump(55);
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(39);


    // section 2
    stateDefault.itemIndex = 25;
    stateDefault.container = null;
    action = slideshowActions.createActionGoPage(1); // greater than 0
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(30);

    action = slideshowActions.createActionGoPage(-1); // greater than 0
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(19);
  });

});
