import { createStore } from 'redux';
import mainReducer from "./mainReducer";

// ----------------------------------------------------------------------------------

export default function configureStore() {

  const store = createStore(mainReducer);

  return store;

};

