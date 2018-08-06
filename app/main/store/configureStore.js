import { createStore } from 'redux';
import mainRootReducer from "./mainRootReducer";

// ----------------------------------------------------------------------------------

export default function configureStore() {

  const store = createStore(mainRootReducer);

  return store;

};

