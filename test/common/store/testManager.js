import {StoreManager} from "../../../app/common/store/storeManager";
import * as constants from "../../../app/common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "rendererManager";

// ----------------------------------------------------------------------------------

export class TestStore {

  constructor(dispatchCallback) {

    this.dispatchCallback = dispatchCallback;

  }

  dispatch(action) {
    this.dispatchCallback(action);
  }
}

// ----------------------------------------------------------------------------------

export class TestManager extends StoreManager {

  constructor() {
    super("test", []);

    this._store = new TestStore(this.dispatchLocal);

    this.data = {
      dispatchLocal: [],
      dispatchRemote: []

    }

    // mock state
    this.mockedState = {

    }



  }

  // ........................................................

  get state() {
    return this.mockedState;
  }

  // .....................................................

  dispatchLocal(action, invokeHook = false) {
    this.data.dispatchLocal.push(action);
  }

  // .....................................................

  dispatchRemote(action, destinationsIn = null) {
    this.data.dispatchRemote.push(action);
  }

  // ........................................................

}

// ----------------------------------------------------------------------------------

const _instanceTestManager = new TestManager();

export default _instanceTestManager;
