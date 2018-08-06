import { createStore } from 'redux';
import workerRootReducer from "./workerRootReducer";

// ----------------------------------------------------------------------------------

export default function configureStore() {

  const store = createStore(workerRootReducer);

  return store;

};
