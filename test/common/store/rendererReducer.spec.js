import { RendererReducer } from '../../../app/common/store/rendererReducer';
import * as rendererActions from '../../../app/common/store/rendererActions';

// ----------------------------------------------------------------------------------

function createDefaultTestState(reducer) {
  const state = reducer.reduce(undefined, {
    type: 'action_name_should_not_exists!!_14e1234'
  });

  return state;
}

function addItemsWithDeliveryKey(state, countNewItems, deliveryKey) {
  for (let i = 0; i < countNewItems; i++) {
    const file = `/abc/${1}`;
    state.items.push({ file, deliveryKey });
  }

  return state;
}

// ----------------------------------------------------------------------------------

describe('goto', () => {
  it('createActionJump', () => {
    let stateOut;
    let action;

    const rendererReducer = new RendererReducer('goto');

    // prepare state
    const stateDefault = createDefaultTestState(rendererReducer);

    addItemsWithDeliveryKey(stateDefault, 10, 1);
    addItemsWithDeliveryKey(stateDefault, 10, 2);
    addItemsWithDeliveryKey(stateDefault, 10, 3);
    addItemsWithDeliveryKey(stateDefault, 10, 4);

    // section 1
    stateDefault.itemIndex = 16;
    stateDefault.container = 'noAutoSelect';
    action = rendererActions.createActionJump(12);
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(28);

    action = rendererActions.createActionJump(55);
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(39);

    // section 2
    stateDefault.itemIndex = 25;
    stateDefault.container = null;
    action = rendererActions.createActionGoPage(1); // greater than 0
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(30);

    action = rendererActions.createActionGoPage(-1); // greater than 0
    stateOut = rendererReducer.reduce(stateDefault, action);

    expect(stateOut === stateDefault).toBe(false);
    expect(stateOut.itemIndex).toBe(19);
  });

  it('addFiles', () => {
    let state;

    function reduceItemsIncKey(
      reducer,
      stateIn,
      countNewItems,
      removeOldItems = false
    ) {
      let testKey = 0;
      if (stateIn.items.length > 0)
        testKey = stateIn.items[stateIn.items.length - 1].testKey;

      const mediaItems = [];
      for (let i = 0; i < countNewItems; i++) {
        testKey++;
        const mediaItem = rendererActions.createMediaItem({
          file: `/abc/${testKey}`,
          testKey
        });
        mediaItem.testKey = testKey;
        mediaItems.push(mediaItem);
      }
      const action = rendererActions.createActionAddAutoFiles(
        mediaItems,
        removeOldItems
      );
      const stateOut = reducer.reduce(stateIn, action);
      return stateOut;
    }

    function checkIncreasingTestKey(stateCheck) {
      let lastItem = null;
      for (let i = 0; i < stateCheck.items.length; i++) {
        const currItem = stateCheck.items[i];
        if (i > 0 && lastItem.testKey >= currItem.testKey) return false;
        lastItem = currItem;
      }
      return true;
    }

    //..................................................

    const expectedMaxCount = 25;

    //..................................................

    const reducer = new RendererReducer('addFiles');

    state = createDefaultTestState(reducer);

    expect(state.items.length).toBe(0);
    expect(state.itemIndex).toBe(-1);

    state.maxItemsPerContainer = expectedMaxCount;

    // standard
    state = reduceItemsIncKey(reducer, state, 8);
    expect(state.items.length).toBe(8);
    expect(state.itemIndex).toBe(0);

    // changed sourceFolder => reset old items
    state.itemIndex = 6;
    state = reduceItemsIncKey(reducer, state, 8, true);
    expect(state.items.length).toBe(8);
    expect(state.itemIndex).toBe(0);

    // standard add
    state = reduceItemsIncKey(reducer, state, 12);
    //console.log('state', state);
    expect(state.items.length).toBe(20);
    expect(state.itemIndex).toBe(0);
    expect(checkIncreasingTestKey(state)).toBe(true);

    // remove items more than maxItemsPerContainer
    const lastItemIndex = 18;
    state.itemIndex = lastItemIndex;
    const expectedTestKey = state.items[lastItemIndex];

    state = reduceItemsIncKey(reducer, state, 12);
    console.log('state', state);
    expect(state.items.length).toBe(expectedMaxCount);
    expect(state.itemIndex).toBeLessThan(lastItemIndex);
    expect(state.items[state.itemIndex]).toBe(expectedTestKey);

    expect(checkIncreasingTestKey(state)).toBe(true);

    //
    // addItems(state, 30);
    //
    // action = rendererActions.createActionAddAutoFiles = (items, removeOldItems = false)

    //addFiles(state, action)
  });
});
