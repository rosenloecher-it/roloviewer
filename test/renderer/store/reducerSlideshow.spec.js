import reducerSlideshow from '../../../app/renderer/store/reducerSlideshow';
import * as actions from "../../../app/common/store/slideshowActions";


function createDefaultTestState() {
  const state = reducerSlideshow(undefined, { type: "action_name_should_not_exists!!_14e1234"});

  return state;
}

function addItems(state, countNewItems, deliveryKey) {

  for (let i = 0; i < countNewItems; i++) {
    const file = `/abc/${1}`;
    state.items.push({file , deliveryKey});
  }

  return state;
}

describe('reducerSlideshow - goto', () => {

  it ('createActionJump', () => {
    let stateOut;
    let action;

    // prepare state
    const stateIn = createDefaultTestState();

    addItems(stateIn, 10, 1);
    addItems(stateIn, 10, 2);
    addItems(stateIn, 10, 3);
    addItems(stateIn, 10, 4);

    // section 1
    stateIn.showIndex = 16;
    stateIn.container = "noAutoSelect";
    action = actions.createActionJump(12);
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(28);

    action = actions.createActionJump(55);
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(39);


    // section 2
    stateIn.showIndex = 25;
    stateIn.container = null;
    action = actions.createActionGoPage(1); // greater than 0
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(30);

    action = actions.createActionGoPage(-1); // greater than 0
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(19);
  });


});
