import {TestManager} from "./testManager";

// ----------------------------------------------------------------------------------

describe('testManager', () => {

  it('base', () => {

    let storeManager = null;

    storeManager = new TestManager();

    storeManager.dispatchLocal({ type: 'dispatchLocal'});
    storeManager.dispatchRemote({ type: 'dispatchRemote'});
    storeManager.dispatchGlobal({ type: 'dispatchGlobal'});

    expect(storeManager.countActions).toBe(3);

    storeManager.clearActions();
    expect(storeManager.countActions).toBe(0);


    const newPowerSaveBlockTime = 2 * storeManager.powerSaveBlockTime;
    const stateRef = storeManager.state;
    stateRef.system.powerSaveBlockTime = newPowerSaveBlockTime;
    const checkPowerSaveBlockTime = storeManager.powerSaveBlockTime;
    expect(checkPowerSaveBlockTime).toBe(newPowerSaveBlockTime);


  });

});
