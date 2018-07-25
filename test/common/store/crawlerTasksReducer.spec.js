import {WorkerReducer} from '../../../app/common/store/workerReducer';
import * as actions from '../../../app/common/store/workerActions';

// ----------------------------------------------------------------------------------

function createDefaultTestState() {
  const reducer = new WorkerReducer('createDefaultTestState');
  const state = reducer.reduce(undefined, { type: "action_name_should_not_exists!!_14e1234"});

  return state;
}

// ----------------------------------------------------------------------------------

describe('WorkerReducer - task handling', () => {

  it ('createActionJump', () => {
    let stateOut, stateIn;
    let action;
    let count;

    const reducer = new WorkerReducer('test');

    // prepare state
    const stateDefault = createDefaultTestState();

    stateIn = stateDefault;
    action = actions.createActionOpen();
    stateOut = reducer.reduce(stateIn, action);
    expect(WorkerReducer.countTasks(stateOut)).toBe(1);

    stateIn = stateOut;
    action = actions.createActionRemoveTask(action);
    stateOut = reducer.reduce(stateIn, action);
    expect(WorkerReducer.countTasks(stateOut)).toBe(0);

    //console.log(`stateOut`, stateOut);

    stateOut = stateDefault;
    action = actions.createActionOpen();
    stateOut = reducer.reduce(stateOut, action);

    const action1 = actions.createActionDeliverMeta('1');
    stateOut = reducer.reduce(stateOut, action1);
    const action2 = actions.createActionDeliverMeta('2');
    stateOut = reducer.reduce(stateOut, action2);
    const action3 = actions.createActionDeliverMeta('3');
    stateOut = reducer.reduce(stateOut, action3);

    expect(WorkerReducer.countTasks(stateOut)).toBe(4);

    stateIn = stateOut;
    action = actions.createActionRemoveTask(action2);
    stateOut = reducer.reduce(stateOut, action);
    expect(WorkerReducer.countTasks(stateOut)).toBe(3);

    expect(WorkerReducer.existsTask(stateOut, action1)).toBe(true);
    expect(WorkerReducer.existsTask(stateOut, action2)).toBe(false);
    expect(WorkerReducer.existsTask(stateOut, action3)).toBe(true);

    action = actions.createActionRemoveTask(action1);
    stateOut = reducer.reduce(stateOut, action);
    expect(WorkerReducer.countTasks(stateOut)).toBe(2);
    expect(WorkerReducer.existsTask(stateOut, action1)).toBe(false);
    expect(WorkerReducer.existsTask(stateOut, action2)).toBe(false);
    expect(WorkerReducer.existsTask(stateOut, action3)).toBe(true);

    action = actions.createActionRemoveTask(action3);
    stateOut = reducer.reduce(stateOut, action);
    expect(WorkerReducer.countTasks(stateOut)).toBe(1);
    expect(WorkerReducer.existsTask(stateOut, action3)).toBe(false);

    //action = ;

    // addItems(stateIn, 10, 1);
    // addItems(stateIn, 10, 2);
    // addItems(stateIn, 10, 3);
    // addItems(stateIn, 10, 4);
    //
    // // section 1
    // stateIn.itemIndex = 16;
    // stateIn.container = "noAutoSelect";
    // action = actions.createActionJump(12);
    // stateOut = slideshowReducer.reduce(stateIn, action);
    //
    // expect(stateOut === stateIn).toBe(false);
    // expect(stateOut.itemIndex).toBe(28);
    //
    // action = actions.createActionJump(55);
    // stateOut = slideshowReducer.reduce(stateIn, action);
    //
    // expect(stateOut === stateIn).toBe(false);
    // expect(stateOut.itemIndex).toBe(39);
    //
    //
    // // section 2
    // stateIn.itemIndex = 25;
    // stateIn.container = null;
    // action = actions.createActionGoPage(1); // greater than 0
    // stateOut = slideshowReducer.reduce(stateIn, action);
    //
    // expect(stateOut === stateIn).toBe(false);
    // expect(stateOut.itemIndex).toBe(30);
    //
    // action = actions.createActionGoPage(-1); // greater than 0
    // stateOut = slideshowReducer.reduce(stateIn, action);
    //
    // expect(stateOut === stateIn).toBe(false);
    // expect(stateOut.itemIndex).toBe(19);
  });


});
