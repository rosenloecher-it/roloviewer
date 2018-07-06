import reducerSlideshow from '../../../app/renderer/store/reducerSlideshow';
import * as actions from '../../../app/renderer/store/actionsSlideshow';
import * as constants from "../../../app/common/constants";
//import {shortenPathElements, separateFilePath, determinePathAndFilename} from "../../app/common/transfromPath";


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

  it ('goJump', () => {
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
    action = actions.goJump(12);
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(28);

    action = actions.goJump(55);
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(39);


    // section 2
    stateIn.showIndex = 25;
    stateIn.container = null;
    action = actions.goPage(1); // greater than 0
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(30);

    action = actions.goPage(-1); // greater than 0
    stateOut = reducerSlideshow(stateIn, action);

    expect(stateOut === stateIn).toBe(false);
    expect(stateOut.showIndex).toBe(19);
  });


});
