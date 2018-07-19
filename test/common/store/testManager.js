import * as constants from "../../../app/common/constants";
import {ContextReducer} from "../../../app/common/store/contextReducer";
import {CrawlerReducer} from "../../../app/common/store/crawlerReducer";
import {MainWindowReducer} from "../../../app/common/store/mainWindowReducer";
import {MessageReducer} from "../../../app/common/store/messageReducer";
import {SlideshowReducer} from "../../../app/common/store/slideshowReducer";
import {StoreManager} from "../../../app/common/store/storeManager";
import {SystemReducer} from "../../../app/common/store/systemReducer";

// ----------------------------------------------------------------------------------

export class TestManager extends StoreManager {

  constructor() {
    super("test", []);

    this.data = {
      dispatchedActions: []
    };

    // mock state
    this.mockedState = TestManager.createDefaultTestState();

  }

  // ........................................................

  static createDefaultTestState() {
    const defaultName = 'createDefaultTestState';
    const undefinedActionKey = 'testnanager_action_name_should_not_exists!!';

    const state = {};

    state.context = (new ContextReducer(defaultName)).reduce(undefined, { type: undefinedActionKey});
    state.crawler = (new CrawlerReducer(defaultName)).reduce(undefined, { type: undefinedActionKey});
    state.mainWindow = (new MainWindowReducer(defaultName)).reduce(undefined, { type: undefinedActionKey});
    state.messages = (new MessageReducer(defaultName)).reduce(undefined, { type: undefinedActionKey});
    state.slideshow = (new SlideshowReducer(defaultName)).reduce(undefined, { type: undefinedActionKey});
    state.system = (new SystemReducer(defaultName)).reduce(undefined, { type: undefinedActionKey});

    return state;
  }

  // ........................................................

  get state() {
    return this.mockedState;
  }

  set state(value) {
    this.mockedState = value;
  }

  // .....................................................

  clearActions() {
    this.data.dispatchedActions = [];
  }

  get actions() {
    return this.data.dispatchedActions;
  }

  get countActions() {

    let i = 0;
    return this.data.dispatchedActions.length;
  }

  // .....................................................

  dispatchLocal(action) {
    this.data.dispatchedActions.push(action);
  }

  // .....................................................

  dispatchRemote(action) {
    this.data.dispatchedActions.push(action);
  }

  // ........................................................

  dispatchGlobal(action) {
    this.data.dispatchedActions.push(action);
  }

  dispatchTask(action) {
    this.data.dispatchedActions.push(action);
  }
}

// ----------------------------------------------------------------------------------

const _instanceTestManager = new TestManager();

export default _instanceTestManager;
